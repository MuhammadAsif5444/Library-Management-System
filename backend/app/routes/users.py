from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models.user import User
from app.utils.decorators import role_required


users_bp = Blueprint(
    "users",
    __name__,
    url_prefix="/api/users"
)


# =========================================================
# GET ALL USERS
# ADMIN ONLY
# =========================================================

@users_bp.route("", methods=["GET"])
@role_required("ADMIN")
def get_users():

    users = User.query.order_by(User.user_id.desc()).all()

    users_data = []

    for user in users:
        users_data.append({
            "user_id": user.user_id,
            "name": user.name,
            "username": user.username,
            "role": user.role,
            "status": user.status,
            "created_at": (
                user.created_at.isoformat()
                if user.created_at else None
            )
        })

    return jsonify({
        "success": True,
        "count": len(users_data),
        "users": users_data
    }), 200


# =========================================================
# GET SINGLE USER
# ADMIN ONLY
# =========================================================

@users_bp.route("/<int:user_id>", methods=["GET"])
@role_required("ADMIN")
def get_user(user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    return jsonify({
        "success": True,
        "user": {
            "user_id": user.user_id,
            "name": user.name,
            "username": user.username,
            "role": user.role,
            "status": user.status,
            "created_at": (
                user.created_at.isoformat()
                if user.created_at else None
            )
        }
    }), 200


# =========================================================
# CREATE USER
# ADMIN ONLY
# =========================================================

@users_bp.route("", methods=["POST"])
@role_required("ADMIN")
def create_user():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body must contain JSON data"
        }), 400

    name = data.get("name")
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    if not all([name, username, password, role]):
        return jsonify({
            "success": False,
            "message": (
                "name, username, password and role are required"
            )
        }), 400

    role = role.upper()

    if role not in ["ADMIN", "LIBRARIAN"]:
        return jsonify({
            "success": False,
            "message": "Role must be ADMIN or LIBRARIAN"
        }), 400

    existing_user = User.query.filter_by(
        username=username
    ).first()

    if existing_user:
        return jsonify({
            "success": False,
            "message": "Username already exists"
        }), 409

    new_user = User(
        name=name,
        username=username,
        password_hash=generate_password_hash(password),
        role=role,
        status="ACTIVE"
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "User created successfully",
        "user": {
            "user_id": new_user.user_id,
            "name": new_user.name,
            "username": new_user.username,
            "role": new_user.role,
            "status": new_user.status
        }
    }), 201


# =========================================================
# UPDATE USER
# ADMIN ONLY
# =========================================================

@users_bp.route("/<int:user_id>", methods=["PUT"])
@role_required("ADMIN")
def update_user(user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body must contain JSON data"
        }), 400

    if "name" in data:
        user.name = data["name"]

    if "username" in data:

        existing_user = User.query.filter(
            User.username == data["username"],
            User.user_id != user_id
        ).first()

        if existing_user:
            return jsonify({
                "success": False,
                "message": "Username already exists"
            }), 409

        user.username = data["username"]

    if "password" in data:
        user.password_hash = generate_password_hash(
            data["password"]
        )

    if "role" in data:

        role = data["role"].upper()

        if role not in ["ADMIN", "LIBRARIAN"]:
            return jsonify({
                "success": False,
                "message": "Role must be ADMIN or LIBRARIAN"
            }), 400

        user.role = role

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "User updated successfully"
    }), 200


# =========================================================
# ACTIVATE / DEACTIVATE USER
# ADMIN ONLY
# =========================================================

@users_bp.route("/<int:user_id>/status", methods=["PATCH"])
@role_required("ADMIN")
def update_user_status(user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    data = request.get_json()

    if not data or "status" not in data:
        return jsonify({
            "success": False,
            "message": "status is required"
        }), 400

    status = data["status"].upper()

    if status not in ["ACTIVE", "INACTIVE"]:
        return jsonify({
            "success": False,
            "message": "Status must be ACTIVE or INACTIVE"
        }), 400

    user.status = status

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "User status updated successfully",
        "status": user.status
    }), 200