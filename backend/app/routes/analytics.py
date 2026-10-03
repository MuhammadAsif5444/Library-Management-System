from datetime import date

from flask import Blueprint, jsonify
from sqlalchemy import func

from app.extensions import db
from app.models.book import Book
from app.models.book_copy import BookCopy
from app.models.member import Member
from app.models.borrowing import Borrowing
from app.models.fine import Fine

from app.utils.decorators import role_required


analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/dashboard", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def dashboard_analytics():

    today = date.today()

    # ==========================================
    # BOOK STATISTICS
    # ==========================================

    total_books = Book.query.count()

    total_copies = (
        db.session.query(
            func.coalesce(
                func.sum(Book.total_copies),
                0
            )
        ).scalar()
    )

    available_copies = (
        db.session.query(
            func.coalesce(
                func.sum(Book.available_copies),
                0
            )
        ).scalar()
    )

    borrowed_copies = (
        total_copies - available_copies
    )

    # ==========================================
    # MEMBER STATISTICS
    # ==========================================

    total_members = Member.query.count()

    active_members = Member.query.filter_by(
        status="ACTIVE"
    ).count()

    # ==========================================
    # BORROWING STATISTICS
    # ==========================================

    active_borrowings = Borrowing.query.filter_by(
        status="BORROWED"
    ).count()

    returned_borrowings = Borrowing.query.filter_by(
        status="RETURNED"
    ).count()

    overdue_borrowings = Borrowing.query.filter(
        Borrowing.return_date.is_(None),
        Borrowing.due_date < today
    ).count()

    # ==========================================
    # FINE STATISTICS
    # ==========================================

    total_fines = (
        db.session.query(
            func.coalesce(
                func.sum(Fine.amount),
                0
            )
        ).scalar()
    )

    unpaid_fines = (
        db.session.query(
            func.coalesce(
                func.sum(Fine.amount),
                0
            )
        )
        .filter(
            Fine.status == "UNPAID"
        )
        .scalar()
    )

    paid_fines = (
        db.session.query(
            func.coalesce(
                func.sum(Fine.amount),
                0
            )
        )
        .filter(
            Fine.status == "PAID"
        )
        .scalar()
    )

    # ==========================================
    # RECENT BORROWINGS
    # ==========================================

    recent_borrowings = (
        Borrowing.query
        .order_by(
            Borrowing.created_at.desc()
        )
        .limit(5)
        .all()
    )

    recent_activity = []

    for borrowing in recent_borrowings:

        recent_activity.append({
            "borrowing_id": borrowing.borrowing_id,
            "member_id": borrowing.member_id,
            "book_id": borrowing.book_id,
            "issue_date": str(
                borrowing.issue_date
            ),
            "due_date": str(
                borrowing.due_date
            ),
            "status": borrowing.status
        })

    # ==========================================
    # RESPONSE
    # ==========================================

    return jsonify({

        "success": True,

        "books": {
            "total_titles": total_books,
            "total_copies": int(total_copies),
            "available_copies": int(
                available_copies
            ),
            "borrowed_copies": int(
                borrowed_copies
            )
        },

        "members": {
            "total": total_members,
            "active": active_members
        },

        "borrowings": {
            "active": active_borrowings,
            "returned": returned_borrowings,
            "overdue": overdue_borrowings
        },

        "fines": {
            "total": float(total_fines),
            "unpaid": float(unpaid_fines),
            "paid": float(paid_fines)
        },

        "recent_activity": recent_activity

    }), 200