from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models.author import Author
from app.utils.decorators import role_required


authors_bp = Blueprint(
    "authors",
    __name__,
    url_prefix="/api/authors"
)


# CREATE AUTHOR
@authors_bp.route("/", methods=["POST"])
@role_required("ADMIN", "LIBRARIAN")
def create_author():

    data = request.get_json()

    if not data or not data.get("name"):
        return jsonify({
            "message": "Author name is required"
        }), 400

    author = Author(
        name=data["name"],
        biography=data.get("biography")
    )

    db.session.add(author)
    db.session.commit()

    return jsonify({
        "message": "Author created successfully",
        "author": author.to_dict()
    }), 201


# GET ALL AUTHORS
@authors_bp.route("/", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def get_authors():

    authors = Author.query.order_by(
        Author.author_id.desc()
    ).all()

    return jsonify({
        "count": len(authors),
        "authors": [
            author.to_dict()
            for author in authors
        ]
    }), 200


# GET SINGLE AUTHOR
@authors_bp.route(
    "/<int:author_id>",
    methods=["GET"]
)
@role_required("ADMIN", "LIBRARIAN")
def get_author(author_id):

    author = db.session.get(
        Author,
        author_id
    )

    if not author:
        return jsonify({
            "message": "Author not found"
        }), 404

    return jsonify({
        "author": author.to_dict()
    }), 200


# UPDATE AUTHOR
@authors_bp.route(
    "/<int:author_id>",
    methods=["PUT"]
)
@role_required("ADMIN", "LIBRARIAN")
def update_author(author_id):

    author = db.session.get(
        Author,
        author_id
    )

    if not author:
        return jsonify({
            "message": "Author not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    if "name" in data:

        if not data["name"].strip():
            return jsonify({
                "message": "Author name cannot be empty"
            }), 400

        author.name = data["name"]

    if "biography" in data:
        author.biography = data["biography"]

    db.session.commit()

    return jsonify({
        "message": "Author updated successfully",
        "author": author.to_dict()
    }), 200


# DELETE AUTHOR
@authors_bp.route(
    "/<int:author_id>",
    methods=["DELETE"]
)
@role_required("ADMIN")
def delete_author(author_id):

    author = db.session.get(
        Author,
        author_id
    )

    if not author:
        return jsonify({
            "message": "Author not found"
        }), 404

    db.session.delete(author)
    db.session.commit()

    return jsonify({
        "message": "Author deleted successfully"
    }), 200