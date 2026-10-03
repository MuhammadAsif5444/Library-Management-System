from functools import wraps

from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt


def role_required(*required_roles):
    """
    Restrict access to users with one of the required roles.

    Example:
        @role_required("ADMIN")
        @role_required("ADMIN", "LIBRARIAN")
    """

    def decorator(fn):

        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):

            claims = get_jwt()
            user_role = claims.get("role")

            if user_role not in required_roles:
                return jsonify({
                    "message": "Access denied",
                    "required_roles": list(required_roles),
                    "your_role": user_role
                }), 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator