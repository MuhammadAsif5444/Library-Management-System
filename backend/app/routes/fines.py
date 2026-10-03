from datetime import date

from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models.fine import Fine
from app.models.borrowing import Borrowing
from app.utils.decorators import role_required


fines_bp = Blueprint(
    "fines",
    __name__,
    url_prefix="/api/fines"
)


def fine_to_dict(fine):
    borrowing = fine.borrowing

    member_name = None
    book_title = None

    if borrowing:
        if borrowing.member:
            member_name = borrowing.member.name

        if borrowing.book:
            book_title = borrowing.book.title

    return {
        "fine_id": fine.fine_id,
        "borrowing_id": fine.borrowing_id,
        "member_name": member_name,
        "book_title": book_title,
        "amount": float(fine.amount or 0),
        "status": fine.status,
        "reason": fine.reason,
        "created_at": (
            fine.created_at.isoformat()
            if fine.created_at
            else None
        ),
        "updated_at": (
            fine.updated_at.isoformat()
            if fine.updated_at
            else None
        ),
    }


# ---------------------------------------------------------
# GET ALL FINES
# ---------------------------------------------------------

@fines_bp.route("", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def get_fines():
    fines = Fine.query.order_by(
        Fine.fine_id.desc()
    ).all()

    return jsonify({
        "success": True,
        "count": len(fines),
        "fines": [
            fine_to_dict(fine)
            for fine in fines
        ]
    }), 200


# ---------------------------------------------------------
# GET SINGLE FINE
# ---------------------------------------------------------

@fines_bp.route("/<int:fine_id>", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def get_fine(fine_id):
    fine = db.session.get(Fine, fine_id)

    if not fine:
        return jsonify({
            "message": "Fine not found"
        }), 404

    return jsonify({
        "success": True,
        "fine": fine_to_dict(fine)
    }), 200


# ---------------------------------------------------------
# CREATE FINE
# ---------------------------------------------------------

@fines_bp.route("", methods=["POST"])
@role_required("ADMIN", "LIBRARIAN")
def create_fine():
    data = request.get_json(silent=True) or {}

    borrowing_id = data.get("borrowing_id")
    amount = data.get("amount")
    reason = data.get("reason")

    if not borrowing_id:
        return jsonify({
            "message": "borrowing_id is required"
        }), 400

    if amount is None:
        return jsonify({
            "message": "amount is required"
        }), 400

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify({
            "message": "amount must be a valid number"
        }), 400

    if amount < 0:
        return jsonify({
            "message": "amount cannot be negative"
        }), 400

    borrowing = db.session.get(
        Borrowing,
        int(borrowing_id)
    )

    if not borrowing:
        return jsonify({
            "message": "Borrowing not found"
        }), 404

    fine = Fine(
        borrowing_id=int(borrowing_id),
        amount=amount,
        status=(
            data.get("status") or "UNPAID"
        ).upper(),
        reason=reason
    )

    db.session.add(fine)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Fine created successfully",
        "fine": fine_to_dict(fine)
    }), 201


# ---------------------------------------------------------
# UPDATE FINE
# ---------------------------------------------------------

@fines_bp.route("/<int:fine_id>", methods=["PUT"])
@role_required("ADMIN", "LIBRARIAN")
def update_fine(fine_id):
    fine = db.session.get(Fine, fine_id)

    if not fine:
        return jsonify({
            "message": "Fine not found"
        }), 404

    data = request.get_json(silent=True) or {}

    if "amount" in data:
        try:
            amount = float(data["amount"])
        except (TypeError, ValueError):
            return jsonify({
                "message": "amount must be a valid number"
            }), 400

        if amount < 0:
            return jsonify({
                "message": "amount cannot be negative"
            }), 400

        fine.amount = amount

    if "status" in data:
        status = str(
            data["status"]
        ).upper()

        allowed_statuses = {
            "UNPAID",
            "PAID",
            "WAIVED"
        }

        if status not in allowed_statuses:
            return jsonify({
                "message": (
                    "Invalid fine status. "
                    "Use UNPAID, PAID or WAIVED."
                )
            }), 400

        fine.status = status

    if "reason" in data:
        fine.reason = data["reason"]

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Fine updated successfully",
        "fine": fine_to_dict(fine)
    }), 200


# ---------------------------------------------------------
# DELETE FINE
# ---------------------------------------------------------

@fines_bp.route("/<int:fine_id>", methods=["DELETE"])
@role_required("ADMIN")
def delete_fine(fine_id):
    fine = db.session.get(Fine, fine_id)

    if not fine:
        return jsonify({
            "message": "Fine not found"
        }), 404

    db.session.delete(fine)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Fine deleted successfully"
    }), 200