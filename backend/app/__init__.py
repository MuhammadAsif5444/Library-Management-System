from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db, migrate, jwt


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                ]
            }
        },
        allow_headers=[
            "Content-Type",
            "Authorization"
        ],
        methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        supports_credentials=False,
    )

    db.init_app(app)

    migrate.init_app(
        app,
        db
    )

    jwt.init_app(app)

    from . import models

    from .routes import register_routes

    register_routes(app)

    return app