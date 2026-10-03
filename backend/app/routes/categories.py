from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models.category import Category
from app.utils.decorators import role_required


categories_bp = Blueprint(
    "categories",
    __name__,
    url_prefix="/api/categories"
)


# CREATE CATEGORY
@categories_bp.route("/", methods=["POST"])
@role_required("ADMIN", "LIBRARIAN")
def create_category():

    data = request.get_json()

    if not data or not data.get("name"):
        return jsonify({
            "message": "Category name is required"
        }), 400

    existing_category = Category.query.filter_by(
        name=data["name"]
    ).first()

    if existing_category:
        return jsonify({
            "message": "Category already exists"
        }), 409

    category = Category(
        name=data["name"],
        description=data.get("description")
    )

    db.session.add(category)
    db.session.commit()

    return jsonify({
        "message": "Category created successfully",
        "category": category.to_dict()
    }), 201


# GET ALL CATEGORIES
@categories_bp.route("/", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def get_categories():

    categories = Category.query.order_by(
        Category.category_id.desc()
    ).all()

    return jsonify({
        "count": len(categories),
        "categories": [
            category.to_dict()
            for category in categories
        ]
    }), 200


# GET SINGLE CATEGORY
@categories_bp.route(
    "/<int:category_id>",
    methods=["GET"]
)
@role_required("ADMIN", "LIBRARIAN")
def get_category(category_id):

    category = db.session.get(
        Category,
        category_id
    )

    if not category:
        return jsonify({
            "message": "Category not found"
        }), 404

    return jsonify({
        "category": category.to_dict()
    }), 200


# UPDATE CATEGORY
@categories_bp.route(
    "/<int:category_id>",
    methods=["PUT"]
)
@role_required("ADMIN", "LIBRARIAN")
def update_category(category_id):

    category = db.session.get(
        Category,
        category_id
    )

    if not category:
        return jsonify({
            "message": "Category not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    if "name" in data:

        if not data["name"].strip():
            return jsonify({
                "message": "Category name cannot be empty"
            }), 400

        existing_category = Category.query.filter(
            Category.name == data["name"],
            Category.category_id != category_id
        ).first()

        if existing_category:
            return jsonify({
                "message": "Category name already exists"
            }), 409

        category.name = data["name"]

    if "description" in data:
        category.description = data["description"]

    db.session.commit()

    return jsonify({
        "message": "Category updated successfully",
        "category": category.to_dict()
    }), 200


# DELETE CATEGORY
@categories_bp.route(
    "/<int:category_id>",
    methods=["DELETE"]
)
@role_required("ADMIN")
def delete_category(category_id):

    category = db.session.get(
        Category,
        category_id
    )

    if not category:
        return jsonify({
            "message": "Category not found"
        }), 404

    db.session.delete(category)
    db.session.commit()

    return jsonify({
        "message": "Category deleted successfully"
    }), 200