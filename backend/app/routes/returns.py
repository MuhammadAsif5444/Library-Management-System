from datetime import date

from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from app.extensions import db
from app.models.borrowing import Borrowing
from app.models.member import Member
from app.models.book import Book
from app.utils.decorators import role_required


returns_bp = Blueprint(
    "returns",
    __name__,
    url_prefix="/api/returns"
)


# =========================================================
# GET BOOKS READY FOR RETURN
# =========================================================

@returns_bp.route("/", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def get_returns():

    page = request.args.get(
        "page",
        1,
        type=int
    )

    per_page = request.args.get(
        "per_page",
        10,
        type=int
    )

    search = request.args.get(
        "search",
        ""
    ).strip()

    query = Borrowing.query.filter(
        Borrowing.status.in_([
            "BORROWED",
            "OVERDUE"
        ])
    )

    # Search by member or book information
    if search:

        search_filter = f"%{search}%"

        query = query.join(
            Member
        ).join(
            Book
        ).filter(
            or_(
                Member.name.ilike(search_filter),
                Member.student_id.ilike(search_filter),
                Book.title.ilike(search_filter),
                Book.isbn.ilike(search_filter)
            )
        )

    query = query.order_by(
        Borrowing.due_date.asc()
    )

    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    today = date.today()

    returns = []

    for borrowing in pagination.items:

        overdue_days = 0

        if borrowing.due_date < today:

            overdue_days = (
                today -
                borrowing.due_date
            ).days

        returns.append({

            "borrowing_id":
                borrowing.borrowing_id,

            "member_name":
                borrowing.member.name
                if borrowing.member
                else "-",

            "student_id":
                borrowing.member.student_id
                if borrowing.member
                else "-",

            "book_title":
                borrowing.book.title
                if borrowing.book
                else "-",

            "isbn":
                borrowing.book.isbn
                if borrowing.book
                else "-",

            "issue_date":
                borrowing.issue_date.isoformat()
                if borrowing.issue_date
                else None,

            "due_date":
                borrowing.due_date.isoformat()
                if borrowing.due_date
                else None,

            "status":
                borrowing.status,

            "overdue_days":
                overdue_days

        })

    return jsonify({

        "returns":
            returns,

        "pagination": {

            "page":
                pagination.page,

            "per_page":
                pagination.per_page,

            "total_items":
                pagination.total,

            "total_pages":
                pagination.pages,

            "has_next":
                pagination.has_next,

            "has_previous":
                pagination.has_prev

        }

    }), 200


# =========================================================
# RETURN BOOK
# =========================================================

@returns_bp.route(
    "/<int:borrowing_id>",
    methods=["POST"]
)
@role_required("ADMIN", "LIBRARIAN")
def return_book(borrowing_id):

    borrowing = db.session.get(
        Borrowing,
        borrowing_id
    )

    if not borrowing:

        return jsonify({
            "message":
                "Borrowing record not found"
        }), 404

    if borrowing.status == "RETURNED":

        return jsonify({
            "message":
                "Book has already been returned"
        }), 400

    today = date.today()

    overdue_days = 0

    if borrowing.due_date < today:

        overdue_days = (
            today -
            borrowing.due_date
        ).days

    borrowing.return_date = today

    borrowing.status = "RETURNED"

    db.session.commit()

    return jsonify({

        "message":
            "Book returned successfully",

        "borrowing": {

            "borrowing_id":
                borrowing.borrowing_id,

            "return_date":
                borrowing.return_date.isoformat(),

            "status":
                borrowing.status,

            "overdue_days":
                overdue_days

        }

    }), 200


# =========================================================
# RETURN HISTORY
# =========================================================

@returns_bp.route(
    "/history",
    methods=["GET"]
)
@role_required("ADMIN", "LIBRARIAN")
def return_history():

    page = request.args.get(
        "page",
        1,
        type=int
    )

    per_page = request.args.get(
        "per_page",
        10,
        type=int
    )

    query = Borrowing.query.filter(
        Borrowing.status == "RETURNED"
    ).order_by(
        Borrowing.return_date.desc()
    )

    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    history = []

    for borrowing in pagination.items:

        history.append({

            "borrowing_id":
                borrowing.borrowing_id,

            "member_name":
                borrowing.member.name
                if borrowing.member
                else "-",

            "student_id":
                borrowing.member.student_id
                if borrowing.member
                else "-",

            "book_title":
                borrowing.book.title
                if borrowing.book
                else "-",

            "isbn":
                borrowing.book.isbn
                if borrowing.book
                else "-",

            "issue_date":
                borrowing.issue_date.isoformat()
                if borrowing.issue_date
                else None,

            "due_date":
                borrowing.due_date.isoformat()
                if borrowing.due_date
                else None,

            "return_date":
                borrowing.return_date.isoformat()
                if borrowing.return_date
                else None

        })

    return jsonify({

        "returns":
            history,

        "pagination": {

            "page":
                pagination.page,

            "per_page":
                pagination.per_page,

            "total_items":
                pagination.total,

            "total_pages":
                pagination.pages,

            "has_next":
                pagination.has_next,

            "has_previous":
                pagination.has_prev

        }

    }), 200