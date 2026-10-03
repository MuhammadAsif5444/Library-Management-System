from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from app.extensions import db
from app.models.borrowing import Borrowing
from app.models.member import Member
from app.models.book import Book
from app.utils.decorators import role_required

borrowings_bp = Blueprint(
    "borrowings",
    __name__,
    url_prefix="/api/borrowings"
)


# ---------------------------------------------
# GET ALL BORROWINGS
# ---------------------------------------------

@borrowings_bp.route("/", methods=["GET"])
def get_borrowings():

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    search = request.args.get("search", "", type=str)
    status = request.args.get("status", type=str)

    query = Borrowing.query

    query = query.join(
        Member,
        Borrowing.member_id == Member.member_id
    ).join(
        Book,
        Borrowing.book_id == Book.book_id
    )

    if search:

        search_filter = f"%{search}%"

        query = query.filter(
            or_(
                Member.name.ilike(search_filter),
                Book.title.ilike(search_filter)
            )
        )

    if status:

        query = query.filter(
            Borrowing.status == status.upper()
        )

    pagination = query.order_by(
        Borrowing.borrowing_id.desc()
    ).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    borrowings = []

    for borrowing in pagination.items:

        borrowings.append({
            "borrowing_id": borrowing.borrowing_id,

            "member_id": borrowing.member_id,
            "member_name": borrowing.member.name,

            "book_id": borrowing.book_id,
            "book_title": borrowing.book.title,

            "copy_id": borrowing.copy_id,

            "status": borrowing.status,

            "issue_date": (
                borrowing.issue_date.isoformat()
                if borrowing.issue_date
                else None
            ),

            "due_date": (
                borrowing.due_date.isoformat()
                if borrowing.due_date
                else None
            ),

            "return_date": (
                borrowing.return_date.isoformat()
                if borrowing.return_date
                else None
            )
        })

    return jsonify({

        "borrowings": borrowings,

        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_previous": pagination.has_prev
        }

    }), 200


# ---------------------------------------------
# GET SINGLE BORROWING
# ---------------------------------------------

@borrowings_bp.route(
    "/<int:borrowing_id>",
    methods=["GET"]
)
def get_borrowing(borrowing_id):

    borrowing = db.session.get(
        Borrowing,
        borrowing_id
    )

    if not borrowing:
        return jsonify({
            "message": "Borrowing record not found"
        }), 404

    return jsonify({
        "borrowing": {
            "borrowing_id": borrowing.borrowing_id,
            "member_id": borrowing.member_id,
            "member_name": borrowing.member.name if borrowing.member else None,
            "book_id": borrowing.book_id,
            "book_title": borrowing.book.title if borrowing.book else None,
            "copy_id": borrowing.copy_id,
            "status": borrowing.status,
            "issue_date": borrowing.issue_date.isoformat() if borrowing.issue_date else None,
            "due_date": borrowing.due_date.isoformat() if borrowing.due_date else None,
            "return_date": borrowing.return_date.isoformat() if borrowing.return_date else None,
            "renewal_count": borrowing.renewal_count
        }
    }), 200


# ---------------------------------------------
# CREATE BORROWING (ISSUE A BOOK)
# ---------------------------------------------

@borrowings_bp.route("/", methods=["POST"])
@role_required("ADMIN", "LIBRARIAN")
def create_borrowing():

    from datetime import date, timedelta
    from app.models.book_copy import BookCopy
    from flask_jwt_extended import get_jwt_identity

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    member_id = data.get("member_id")
    book_id = data.get("book_id")
    copy_id = data.get("copy_id")

    if not member_id or not book_id:
        return jsonify({
            "message": "member_id and book_id are required"
        }), 400

    member = db.session.get(Member, member_id)
    if not member:
        return jsonify({"message": "Member not found"}), 404

    book = db.session.get(Book, book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404

    # Pick an available copy if none specified
    if copy_id:
        copy = db.session.get(BookCopy, copy_id)
    else:
        copy = BookCopy.query.filter_by(
            book_id=book_id,
            status="AVAILABLE"
        ).first()

    if not copy or copy.status != "AVAILABLE":
        return jsonify({
            "message": "No available copy for this book"
        }), 409

    issue_date = date.today()
    due_date = issue_date + timedelta(days=14)

    try:
        issued_by = get_jwt_identity()
    except Exception:
        issued_by = None

    borrowing = Borrowing(
        member_id=member_id,
        book_id=book_id,
        copy_id=copy.copy_id,
        issued_by=issued_by,
        issue_date=issue_date,
        due_date=due_date,
        status="BORROWED"
    )

    copy.status = "BORROWED"

    db.session.add(borrowing)
    db.session.commit()

    return jsonify({
        "message": "Book issued successfully",
        "borrowing_id": borrowing.borrowing_id
    }), 201


# ---------------------------------------------
# RETURN A BOOK
# ---------------------------------------------

@borrowings_bp.route(
    "/<int:borrowing_id>/return",
    methods=["PUT"]
)
@role_required("ADMIN", "LIBRARIAN")
def return_borrowing(borrowing_id):

    from datetime import date

    borrowing = db.session.get(Borrowing, borrowing_id)

    if not borrowing:
        return jsonify({
            "message": "Borrowing record not found"
        }), 404

    if borrowing.status == "RETURNED":
        return jsonify({
            "message": "This book has already been returned"
        }), 409

    borrowing.return_date = date.today()
    borrowing.status = "RETURNED"

    if borrowing.copy:
        borrowing.copy.status = "AVAILABLE"

    db.session.commit()

    return jsonify({
        "message": "Book returned successfully"
    }), 200
