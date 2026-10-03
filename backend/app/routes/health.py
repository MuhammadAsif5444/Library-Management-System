from flask import Blueprint, jsonify
from sqlalchemy import text

from app.extensions import db


health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    try:
        db.session.execute(text("SELECT 1"))

        return jsonify({
            "status": "success",
            "message": "Library Management System API is running",
            "database": "connected"
        }), 200

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": "Database connection failed",
            "error": str(error)
        }), 500