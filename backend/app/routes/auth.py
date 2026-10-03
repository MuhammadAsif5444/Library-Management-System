from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from werkzeug.security import check_password_hash

from app.models.user import User
from app.models.member import Member
from app.extensions import db
from app.utils.decorators import role_required


# ============================================================
# AUTH BLUEPRINT
# ============================================================

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


# ============================================================
# USER LOGIN
# ============================================================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "message": "Username and password are required"
        }), 400

    user = User.query.filter_by(
        username=username
    ).first()

    if not user:
        return jsonify({
            "message": "Invalid username or password"
        }), 401

    if user.status != "ACTIVE":
        return jsonify({
            "message": "Account is inactive"
        }), 403

    if not check_password_hash(
        user.password_hash,
        password
    ):
        return jsonify({
            "message": "Invalid username or password"
        }), 401

    access_token = create_access_token(
        identity=str(user.user_id),
        additional_claims={
            "role": user.role,
            "account_type": "USER"
        }
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.user_id,
            "name": user.name,
            "username": user.username,
            "role": user.role
        }
    }), 200


# ============================================================
# MEMBER LOGIN
# ============================================================

@auth_bp.route("/member/login", methods=["POST"])
def member_login():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    student_id = data.get("student_id")
    password = data.get("password")

    if not student_id or not password:
        return jsonify({
            "message": "Student ID and password are required"
        }), 400

    member = Member.query.filter_by(
        student_id=student_id
    ).first()

    if not member:
        return jsonify({
            "message": "Invalid student ID or password"
        }), 401

    if member.status != "ACTIVE":
        return jsonify({
            "message": "Account is inactive"
        }), 403

    if not check_password_hash(
        member.password_hash,
        password
    ):
        return jsonify({
            "message": "Invalid student ID or password"
        }), 401

    access_token = create_access_token(
        identity=str(member.member_id),
        additional_claims={
            "role": "MEMBER",
            "account_type": "MEMBER"
        }
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "member": {
            "id": member.member_id,
            "name": member.name,
            "student_id": member.student_id,
            "role": "MEMBER"
        }
    }), 200


# ============================================================
# CURRENT USER
# ============================================================

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():

    identity = get_jwt_identity()
    claims = get_jwt()
    account_type = claims.get("account_type", "USER")

    if account_type == "MEMBER":
        member = db.session.get(Member, int(identity))
        if not member:
            return jsonify({"message": "Member not found"}), 404
        return jsonify({
            "id": member.member_id,
            "name": member.name,
            "username": member.student_id,
            "student_id": member.student_id,
            "role": "MEMBER",
            "account_type": "MEMBER"
        }), 200

    user = db.session.get(User, int(identity))
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user.user_id,
        "name": user.name,
        "username": user.username,
        "role": user.role,
        "status": user.status,
        "account_type": "USER"
    }), 200


# ============================================================
# ADMIN TEST
# ============================================================

@auth_bp.route("/admin-test", methods=["GET"])
@role_required("ADMIN")
def admin_test():

    return jsonify({
        "message": "Welcome Admin. You have access to this protected resource."
    }), 200