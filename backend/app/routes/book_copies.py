from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models.book_copy import BookCopy
from app.models.book import Book
from app.utils.decorators import role_required


book_copies_bp = Blueprint(
    "book_copies",
    __name__,
    url_prefix="/api/book-copies"
)


def copy_to_dict(copy):
    return {
        "copy_id": copy.copy_id,
        "book_id": copy.book_id,
        "book_title": copy.book.title if copy.book else None,
        "accession_number": copy.accession_number,
        "shelf_location": copy.shelf_location,
        "status": copy.status,
        "created_at": (
            copy.created_at.isoformat()
            if copy.created_at
            else None
        ),
        "updated_at": (
            copy.updated_at.isoformat()
            if copy.updated_at
            else None
        ),
    }


# ============================================================
# GET ALL BOOK COPIES
# ============================================================

@book_copies_bp.route("", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def get_book_copies():

    copies = BookCopy.query.order_by(
        BookCopy.copy_id.desc()
    ).all()

    return jsonify({
        "success": True,
        "count": len(copies),
        "book_copies": [
            copy_to_dict(copy)
            for copy in copies
        ]
    }), 200


# ============================================================
# CREATE BOOK COPY
# ============================================================

@book_copies_bp.route("", methods=["POST"])
@role_required("ADMIN", "LIBRARIAN")
def create_book_copy():

    data = request.get_json(silent=True) or {}

    book_id = data.get("book_id")
    accession_number = data.get("accession_number")
    shelf_location = data.get("shelf_location")
    status = str(
        data.get("status", "AVAILABLE")
    ).upper()

    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------

    if not book_id:
        return jsonify({
            "message": "book_id is required"
        }), 400

    if not accession_number:
        return jsonify({
            "message": "accession_number is required"
        }), 400

    book = db.session.get(
        Book,
        int(book_id)
    )

    if not book:
        return jsonify({
            "message": "Book not found"
        }), 404

    # --------------------------------------------------------
    # Check duplicate accession number
    # --------------------------------------------------------

    existing = BookCopy.query.filter_by(
        accession_number=accession_number
    ).first()

    if existing:
        return jsonify({
            "message": "Accession number already exists"
        }), 409

    # --------------------------------------------------------
    # Validate status
    # --------------------------------------------------------

    allowed_statuses = {
        "AVAILABLE",
        "BORROWED",
        "LOST",
        "DAMAGED",
        "MAINTENANCE"
    }

    if status not in allowed_statuses:
        return jsonify({
            "message": (
                "Invalid status. Use AVAILABLE, BORROWED, "
                "LOST, DAMAGED or MAINTENANCE."
            )
        }), 400

    # --------------------------------------------------------
    # Create copy
    # --------------------------------------------------------

    copy = BookCopy(
        book_id=int(book_id),
        accession_number=accession_number,
        shelf_location=shelf_location,
        status=status
    )

    db.session.add(copy)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Book copy created successfully",
        "book_copy": copy_to_dict(copy)
    }), 201


# ============================================================
# GET SINGLE BOOK COPY
# ============================================================

@book_copies_bp.route(
    "/<int:copy_id>",
    methods=["GET"]
)
@role_required("ADMIN", "LIBRARIAN")
def get_book_copy(copy_id):

    copy = db.session.get(
        BookCopy,
        copy_id
    )

    if not copy:
        return jsonify({
            "message": "Book copy not found"
        }), 404

    return jsonify({
        "success": True,
        "book_copy": copy_to_dict(copy)
    }), 200


# ============================================================
# UPDATE BOOK COPY
# ============================================================

@book_copies_bp.route(
    "/<int:copy_id>",
    methods=["PUT"]
)
@role_required("ADMIN", "LIBRARIAN")
def update_book_copy(copy_id):

    copy = db.session.get(
        BookCopy,
        copy_id
    )

    if not copy:
        return jsonify({
            "message": "Book copy not found"
        }), 404

    data = request.get_json(silent=True) or {}

    # --------------------------------------------------------
    # Update Book
    # --------------------------------------------------------

    if "book_id" in data:

        book_id = data.get("book_id")

        if not book_id:
            return jsonify({
                "message": "book_id cannot be empty"
            }), 400

        book = db.session.get(
            Book,
            int(book_id)
        )

        if not book:
            return jsonify({
                "message": "Book not found"
            }), 404

        copy.book_id = int(book_id)

    # --------------------------------------------------------
    # Update Accession Number
    # --------------------------------------------------------

    if "accession_number" in data:

        accession_number = str(
            data.get("accession_number")
        ).strip()

        if not accession_number:
            return jsonify({
                "message": "accession_number cannot be empty"
            }), 400

        duplicate = BookCopy.query.filter(
            BookCopy.accession_number == accession_number,
            BookCopy.copy_id != copy_id
        ).first()

        if duplicate:
            return jsonify({
                "message": "Accession number already exists"
            }), 409

        copy.accession_number = accession_number

    # --------------------------------------------------------
    # Update Shelf Location
    # --------------------------------------------------------

    if "shelf_location" in data:

        copy.shelf_location = data.get(
            "shelf_location"
        )

    # --------------------------------------------------------
    # Update Status
    # --------------------------------------------------------

    if "status" in data:

        status = str(
            data.get("status")
        ).upper()

        allowed_statuses = {
            "AVAILABLE",
            "BORROWED",
            "LOST",
            "DAMAGED",
            "MAINTENANCE"
        }

        if status not in allowed_statuses:
            return jsonify({
                "message": (
                    "Invalid status. Use AVAILABLE, BORROWED, "
                    "LOST, DAMAGED or MAINTENANCE."
                )
            }), 400

        copy.status = status

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Book copy updated successfully",
        "book_copy": copy_to_dict(copy)
    }), 200


# ============================================================
# DELETE BOOK COPY
# ============================================================

@book_copies_bp.route(
    "/<int:copy_id>",
    methods=["DELETE"]
)
@role_required("ADMIN")
def delete_book_copy(copy_id):

    copy = db.session.get(
        BookCopy,
        copy_id
    )

    if not copy:
        return jsonify({
            "message": "Book copy not found"
        }), 404

    # --------------------------------------------------------
    # Prevent deleting a copy with borrowing history
    # --------------------------------------------------------

    if copy.borrowings:

        return jsonify({
            "message": (
                "This book copy cannot be deleted because "
                "it has borrowing history. "
                "Change its status instead."
            )
        }), 409

    db.session.delete(copy)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Book copy deleted successfully"
    }), 200