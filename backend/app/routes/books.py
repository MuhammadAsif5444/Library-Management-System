from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from app.extensions import db
from app.models.book import Book
from app.models.author import Author
from app.models.category import Category
from app.utils.decorators import role_required

books_bp = Blueprint(
    "books",
    __name__,
    url_prefix="/api/books"
)


@books_bp.route("/", methods=["GET"])
def get_books():

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    search = request.args.get("search", "").strip()
    category_id = request.args.get("category_id", type=int)
    author_id = request.args.get("author_id", type=int)
    status = request.args.get("status", "").strip()

    sort_by = request.args.get("sort_by", "title")
    sort_order = request.args.get("sort_order", "asc")

    query = Book.query

    # Search
    if search:
        search_filter = f"%{search}%"

        query = query.filter(
            or_(
                Book.title.ilike(search_filter),
                Book.isbn.ilike(search_filter),
                Book.publisher.ilike(search_filter)
            )
        )

    # Category filter
    if category_id:
        query = query.filter(
            Book.category_id == category_id
        )

    # Author filter
    if author_id:
        query = query.filter(
            Book.author_id == author_id
        )

    # Status filter
    if status:
        query = query.filter(
            Book.status == status.upper()
        )

    # Sorting
    allowed_sort_fields = {
        "title": Book.title,
        "isbn": Book.isbn,
        "publication_year": Book.publication_year,
        "total_copies": Book.total_copies,
        "available_copies": Book.available_copies
    }

    sort_column = allowed_sort_fields.get(
        sort_by,
        Book.title
    )

    if sort_order.lower() == "desc":
        query = query.order_by(
            sort_column.desc()
        )
    else:
        query = query.order_by(
            sort_column.asc()
        )

    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return jsonify({
        "books": [
            book.to_dict()
            for book in pagination.items
        ],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_previous": pagination.has_prev
        }
    }), 200

VALID_STATUSES = [
    "AVAILABLE",
    "UNAVAILABLE",
    "INACTIVE"
]


# ---------------------------------------------
# CREATE BOOK
# ---------------------------------------------

@books_bp.route("/", methods=["POST"])
@role_required("ADMIN", "LIBRARIAN")
def create_book():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    required_fields = [
        "isbn",
        "title",
        "author_id",
        "category_id"
    ]

    for field in required_fields:

        if not data.get(field):
            return jsonify({
                "message": f"{field} is required"
            }), 400

    existing_book = Book.query.filter_by(
        isbn=data["isbn"]
    ).first()

    if existing_book:
        return jsonify({
            "message": "ISBN already exists"
        }), 409

    author = db.session.get(
        Author,
        data["author_id"]
    )

    if not author:
        return jsonify({
            "message": "Author not found"
        }), 404

    category = db.session.get(
        Category,
        data["category_id"]
    )

    if not category:
        return jsonify({
            "message": "Category not found"
        }), 404

    total_copies = data.get(
        "total_copies",
        1
    )

    if not isinstance(total_copies, int) or total_copies < 1:
        return jsonify({
            "message": "total_copies must be at least 1"
        }), 400

    status = data.get(
        "status",
        "AVAILABLE"
    )

    if status not in VALID_STATUSES:
        return jsonify({
            "message": "Invalid book status",
            "allowed_statuses": VALID_STATUSES
        }), 400

    book = Book(

        isbn=data["isbn"],

        title=data["title"],

        author_id=data["author_id"],

        category_id=data["category_id"],

        publisher=data.get("publisher"),

        publication_year=data.get(
            "publication_year"
        ),

        total_copies=total_copies,

        available_copies=total_copies,

        shelf_location=data.get(
            "shelf_location"
        ),

        status=status
    )

    db.session.add(book)

    db.session.commit()

    return jsonify({

        "message": "Book created successfully",

        "book": book.to_dict()

    }), 201


# ---------------------------------------------
# GET SINGLE BOOK
# ---------------------------------------------

@books_bp.route(
    "/<int:book_id>",
    methods=["GET"]
)
@role_required("ADMIN", "LIBRARIAN")
def get_book(book_id):

    book = db.session.get(
        Book,
        book_id
    )

    if not book:
        return jsonify({
            "message": "Book not found"
        }), 404

    return jsonify({
        "book": book.to_dict()
    }), 200


# ---------------------------------------------
# UPDATE BOOK
# ---------------------------------------------

@books_bp.route(
    "/<int:book_id>",
    methods=["PUT"]
)
@role_required("ADMIN", "LIBRARIAN")
def update_book(book_id):

    book = db.session.get(
        Book,
        book_id
    )

    if not book:
        return jsonify({
            "message": "Book not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    if "isbn" in data:

        existing_book = Book.query.filter(
            Book.isbn == data["isbn"],
            Book.book_id != book_id
        ).first()

        if existing_book:
            return jsonify({
                "message": "ISBN already exists"
            }), 409

        book.isbn = data["isbn"]

    if "title" in data:

        if not data["title"].strip():
            return jsonify({
                "message": "Title cannot be empty"
            }), 400

        book.title = data["title"]

    if "author_id" in data:

        author = db.session.get(
            Author,
            data["author_id"]
        )

        if not author:
            return jsonify({
                "message": "Author not found"
            }), 404

        book.author_id = data["author_id"]

    if "category_id" in data:

        category = db.session.get(
            Category,
            data["category_id"]
        )

        if not category:
            return jsonify({
                "message": "Category not found"
            }), 404

        book.category_id = data["category_id"]

    if "publisher" in data:
        book.publisher = data["publisher"]

    if "publication_year" in data:
        book.publication_year = data["publication_year"]

    if "shelf_location" in data:
        book.shelf_location = data["shelf_location"]

    if "status" in data:

        if data["status"] not in VALID_STATUSES:
            return jsonify({
                "message": "Invalid book status",
                "allowed_statuses": VALID_STATUSES
            }), 400

        book.status = data["status"]

    if "total_copies" in data:

        total_copies = data["total_copies"]

        if not isinstance(total_copies, int) or total_copies < 1:
            return jsonify({
                "message": "total_copies must be at least 1"
            }), 400

        difference = (
            total_copies -
            book.total_copies
        )

        book.total_copies = total_copies

        book.available_copies = max(
            0,
            book.available_copies + difference
        )

    db.session.commit()

    return jsonify({

        "message": "Book updated successfully",

        "book": book.to_dict()

    }), 200


# ---------------------------------------------
# SEARCH BOOKS
# ---------------------------------------------

@books_bp.route(
    "/search",
    methods=["GET"]
)
@role_required("ADMIN", "LIBRARIAN")
def search_books():

    query = request.args.get(
        "q",
        ""
    ).strip()

    if not query:
        return jsonify({
            "message": "Search query is required"
        }), 400

    books = Book.query.filter(

        or_(

            Book.title.ilike(
                f"%{query}%"
            ),

            Book.isbn.ilike(
                f"%{query}%"
            ),

            Book.publisher.ilike(
                f"%{query}%"
            )

        )

    ).all()

    return jsonify({

        "count": len(books),

        "books": [
            book.to_dict()
            for book in books
        ]

    }), 200


# ---------------------------------------------
# FILTER BOOKS
# ---------------------------------------------

@books_bp.route(
    "/filter",
    methods=["GET"]
)
@role_required("ADMIN", "LIBRARIAN")
def filter_books():

    author_id = request.args.get(
        "author_id",
        type=int
    )

    category_id = request.args.get(
        "category_id",
        type=int
    )

    status = request.args.get(
        "status"
    )

    query = Book.query

    if author_id:
        query = query.filter(
            Book.author_id == author_id
        )

    if category_id:
        query = query.filter(
            Book.category_id == category_id
        )

    if status:

        if status not in VALID_STATUSES:
            return jsonify({
                "message": "Invalid book status"
            }), 400

        query = query.filter(
            Book.status == status
        )

    books = query.all()

    return jsonify({

        "count": len(books),

        "books": [
            book.to_dict()
            for book in books
        ]

    }), 200


# ---------------------------------------------
# DELETE BOOK
# ---------------------------------------------

@books_bp.route(
    "/<int:book_id>",
    methods=["DELETE"]
)
@role_required("ADMIN")
def delete_book(book_id):

    book = db.session.get(
        Book,
        book_id
    )

    if not book:
        return jsonify({
            "message": "Book not found"
        }), 404

    db.session.delete(book)

    db.session.commit()

    return jsonify({

        "message": "Book deleted successfully"

    }), 200