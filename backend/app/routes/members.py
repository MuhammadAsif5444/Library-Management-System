from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash
from sqlalchemy import or_

from app.extensions import db
from app.models.member import Member
from app.models.borrowing import Borrowing
from app.utils.decorators import role_required


members_bp = Blueprint(
    "members",
    __name__,
    url_prefix="/api/members"
)


# =========================================================
# GET ALL MEMBERS
# ADMIN AND LIBRARIAN
# =========================================================

@members_bp.route("", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def get_members():

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    if page < 1:
        page = 1

    if per_page < 1:
        per_page = 10

    if per_page > 100:
        per_page = 100

    search = request.args.get("search", "").strip()
    status = request.args.get("status", "").strip()

    sort_by = request.args.get(
        "sort_by",
        "name"
    )

    sort_order = request.args.get(
        "sort_order",
        "asc"
    ).lower()

    query = Member.query

    if search:

        search_filter = f"%{search}%"

        query = query.filter(
            or_(
                Member.name.ilike(search_filter),
                Member.student_id.ilike(search_filter),
                Member.email.ilike(search_filter),
                Member.phone.ilike(search_filter)
            )
        )

    if status:

        query = query.filter(
            Member.status == status.upper()
        )

    allowed_sort_fields = {
        "name": Member.name,
        "student_id": Member.student_id,
        "email": Member.email,
        "registered_at": Member.registered_at
    }

    sort_column = allowed_sort_fields.get(
        sort_by,
        Member.name
    )

    if sort_order == "desc":

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
        "success": True,
        "members": [
            member.to_dict()
            for member in pagination.items
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


# =========================================================
# CREATE MEMBER
# ADMIN AND LIBRARIAN
# =========================================================

@members_bp.route("", methods=["POST"])
@role_required("ADMIN", "LIBRARIAN")
def create_member():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    required_fields = [
        "student_id",
        "name",
        "password"
    ]

    for field in required_fields:

        if not data.get(field):

            return jsonify({
                "success": False,
                "message": f"{field} is required"
            }), 400

    student_id = str(
        data["student_id"]
    ).strip()

    name = str(
        data["name"]
    ).strip()

    if not student_id or not name:

        return jsonify({
            "success": False,
            "message": "Student ID and name cannot be empty"
        }), 400

    existing_student = Member.query.filter_by(
        student_id=student_id
    ).first()

    if existing_student:

        return jsonify({
            "success": False,
            "message": "Student ID already exists"
        }), 409

    email = data.get("email")

    if email:
        email = str(email).strip()

        existing_email = Member.query.filter_by(
            email=email
        ).first()

        if existing_email:

            return jsonify({
                "success": False,
                "message": "Email already exists"
            }), 409

    status = str(
        data.get("status", "ACTIVE")
    ).upper()

    if status not in ["ACTIVE", "INACTIVE"]:

        return jsonify({
            "success": False,
            "message": "Status must be ACTIVE or INACTIVE"
        }), 400

    new_member = Member(
        student_id=student_id,
        name=name,
        email=email,
        phone=data.get("phone"),
        address=data.get("address"),
        password_hash=generate_password_hash(
            data["password"]
        ),
        status=status
    )

    db.session.add(new_member)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Member created successfully",
        "member": new_member.to_dict()
    }), 201


# =========================================================
# SEARCH MEMBERS
# ADMIN AND LIBRARIAN
# =========================================================

@members_bp.route("/search", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def search_members():

    search_query = request.args.get(
        "q",
        ""
    ).strip()

    if not search_query:

        return jsonify({
            "success": False,
            "message": "Search query is required"
        }), 400

    search_filter = f"%{search_query}%"

    members = Member.query.filter(
        or_(
            Member.name.ilike(search_filter),
            Member.student_id.ilike(search_filter),
            Member.email.ilike(search_filter)
        )
    ).all()

    return jsonify({
        "success": True,
        "count": len(members),
        "members": [
            member.to_dict()
            for member in members
        ]
    }), 200


# =========================================================
# GET SINGLE MEMBER
# =========================================================

@members_bp.route("/<int:member_id>", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def get_member(member_id):

    member = db.session.get(
        Member,
        member_id
    )

    if not member:

        return jsonify({
            "success": False,
            "message": "Member not found"
        }), 404

    return jsonify({
        "success": True,
        "member": member.to_dict()
    }), 200


# =========================================================
# UPDATE MEMBER
# =========================================================

@members_bp.route("/<int:member_id>", methods=["PUT"])
@role_required("ADMIN", "LIBRARIAN")
def update_member(member_id):

    member = db.session.get(
        Member,
        member_id
    )

    if not member:

        return jsonify({
            "success": False,
            "message": "Member not found"
        }), 404

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    if "student_id" in data:

        student_id = str(
            data["student_id"]
        ).strip()

        existing_student = Member.query.filter(
            Member.student_id == student_id,
            Member.member_id != member_id
        ).first()

        if existing_student:

            return jsonify({
                "success": False,
                "message": "Student ID already exists"
            }), 409

        member.student_id = student_id

    if "name" in data:

        member.name = str(
            data["name"]
        ).strip()

    if "email" in data:

        email = data["email"]

        if email:
            email = str(email).strip()

            existing_email = Member.query.filter(
                Member.email == email,
                Member.member_id != member_id
            ).first()

            if existing_email:

                return jsonify({
                    "success": False,
                    "message": "Email already exists"
                }), 409

        member.email = email

    if "phone" in data:
        member.phone = data["phone"]

    if "address" in data:
        member.address = data["address"]

    if "password" in data:

        if data["password"]:

            member.password_hash = generate_password_hash(
                data["password"]
            )

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Member updated successfully",
        "member": member.to_dict()
    }), 200


# =========================================================
# CHANGE MEMBER STATUS
# =========================================================

@members_bp.route(
    "/<int:member_id>/status",
    methods=["PUT", "PATCH"]
)
@role_required("ADMIN", "LIBRARIAN")
def update_member_status(member_id):

    member = db.session.get(
        Member,
        member_id
    )

    if not member:

        return jsonify({
            "success": False,
            "message": "Member not found"
        }), 404

    data = request.get_json()

    status = (
        data.get("status")
        if data else None
    )

    if not status:

        return jsonify({
            "success": False,
            "message": "Status is required"
        }), 400

    status = str(status).upper()

    allowed_statuses = [
        "ACTIVE",
        "INACTIVE"
    ]

    if status not in allowed_statuses:

        return jsonify({
            "success": False,
            "message": "Invalid status",
            "allowed_statuses": allowed_statuses
        }), 400

    member.status = status

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Member status updated successfully",
        "member": member.to_dict()
    }), 200


# =========================================================
# DELETE MEMBER
# ADMIN ONLY
# =========================================================

@members_bp.route(
    "/<int:member_id>",
    methods=["DELETE"]
)
@role_required("ADMIN")
def delete_member(member_id):

    member = db.session.get(
        Member,
        member_id
    )

    if not member:

        return jsonify({
            "success": False,
            "message": "Member not found"
        }), 404

    borrowing_count = Borrowing.query.filter_by(
        member_id=member_id
    ).count()

    if borrowing_count > 0:

        return jsonify({
            "success": False,
            "message": (
                "Member cannot be deleted because "
                "borrowing records exist"
            ),
            "borrowing_count": borrowing_count,
            "suggestion": (
                "Set the member status to INACTIVE instead"
            )
        }), 409

    try:

        db.session.delete(member)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Member deleted successfully"
        }), 200

    except Exception:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to delete member"
        }), 500