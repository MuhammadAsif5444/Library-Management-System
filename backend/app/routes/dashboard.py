from flask import Blueprint, jsonify
from app.extensions import db
from app.models.book import Book
from app.models.book_copy import BookCopy
from app.models.member import Member
from app.models.user import User
from app.models.borrowing import Borrowing
from app.models.fine import Fine


dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/statistics", methods=["GET"])
def get_statistics():
    try:
        total_books = Book.query.count()
        total_book_copies = BookCopy.query.count()
        total_members = Member.query.count()
        total_users = User.query.count()
        total_borrowings = Borrowing.query.count()
        total_fines = Fine.query.count()

        return jsonify({
            "data": {
                "total_books": total_books,
                "total_book_copies": total_book_copies,
                "total_members": total_members,
                "total_users": total_users,
                "total_borrowings": total_borrowings,
                "total_fines": total_fines
            }
        }), 200

    except Exception as e:
        print("Dashboard statistics error:", e)

        return jsonify({
            "message": "Failed to load dashboard statistics",
            "error": str(e)
        }), 500