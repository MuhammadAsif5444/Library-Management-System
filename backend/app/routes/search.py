from flask import Blueprint, request, jsonify

from app.models.book import Book
from app.models.member import Member
from app.models.author import Author


search_bp = Blueprint(
    "search",
    __name__
)


@search_bp.route("/", methods=["GET"])
def global_search():

    query = request.args.get(
        "q",
        "",
        type=str
    ).strip()

    if not query:

        return jsonify({
            "books": [],
            "members": [],
            "authors": []
        }), 200

    search_filter = f"%{query}%"

    books = Book.query.filter(
        Book.title.ilike(search_filter)
    ).limit(5).all()

    members = Member.query.filter(
        Member.name.ilike(search_filter)
    ).limit(5).all()

    authors = Author.query.filter(
        Author.name.ilike(search_filter)
    ).limit(5).all()

    return jsonify({

        "books": [
            {
                "book_id": book.book_id,
                "title": book.title,
                "isbn": book.isbn
            }
            for book in books
        ],

        "members": [
            {
                "member_id": member.member_id,
                "name": member.name,
                "student_id": member.student_id
            }
            for member in members
        ],

        "authors": [
            {
                "author_id": author.author_id,
                "name": author.name
            }
            for author in authors
        ]

    }), 200