from datetime import date

from flask import Blueprint, jsonify
from sqlalchemy import func

from app.extensions import db
from app.models.borrowing import Borrowing
from app.models.book import Book
from app.models.fine import Fine


notifications_bp = Blueprint(
    "notifications",
    __name__
)


@notifications_bp.route("/", methods=["GET"])
def get_notifications():

    notifications = []

    today = date.today()


    # -------------------------
    # Overdue Borrowings
    # -------------------------

    overdue_borrowings = Borrowing.query.filter(
        Borrowing.status == "OVERDUE"
    ).all()

    for borrowing in overdue_borrowings:

        days_overdue = 0

        if borrowing.due_date:

            days_overdue = max(
                (today - borrowing.due_date).days,
                0
            )

        notifications.append({

            "type": "OVERDUE",

            "title": "Overdue Book",

            "message": (
                f"Borrowing #{borrowing.borrowing_id} "
                f"is overdue by {days_overdue} day(s)."
            ),

            "borrowing_id": borrowing.borrowing_id,

            "created_at": (
                borrowing.created_at.isoformat()
                if borrowing.created_at
                else None
            )

        })


    # -------------------------
    # Low Availability Books
    # -------------------------

    low_stock_books = Book.query.filter(
        Book.available_copies <= 1
    ).all()

    for book in low_stock_books:

        notifications.append({

            "type": "LOW_STOCK",

            "title": "Low Book Availability",

            "message": (
                f'"{book.title}" has only '
                f"{book.available_copies} available copy/copies."
            ),

            "book_id": book.book_id,

            "created_at": None

        })


    # -------------------------
    # Unpaid Fines
    # -------------------------

    unpaid_fines = Fine.query.filter(
        Fine.status == "UNPAID"
    ).all()

    for fine in unpaid_fines:

        notifications.append({

            "type": "UNPAID_FINE",

            "title": "Unpaid Fine",

            "message": (
                f"Fine #{fine.fine_id} has an unpaid "
                f"amount of {float(fine.amount)}."
            ),

            "fine_id": fine.fine_id,

            "created_at": (
                fine.created_at.isoformat()
                if fine.created_at
                else None
            )

        })


    return jsonify({

        "count": len(notifications),

        "notifications": notifications

    }), 200