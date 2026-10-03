from .auth import auth_bp
from .health import health_bp
from .users import users_bp
from .authors import authors_bp
from .categories import categories_bp
from .books import books_bp
from .members import members_bp
from .borrowings import borrowings_bp
from .dashboard import dashboard_bp
from .analytics import analytics_bp
from .reports import reports_bp
from .search import search_bp
from .notifications import notifications_bp
from .book_copies import book_copies_bp
from .returns import returns_bp
from .fines import fines_bp


def register_routes(app):

    app.register_blueprint(
        health_bp,
        url_prefix="/api"
    )

    app.register_blueprint(auth_bp)

    app.register_blueprint(users_bp)

    app.register_blueprint(authors_bp)

    app.register_blueprint(categories_bp)

    app.register_blueprint(books_bp)

    app.register_blueprint(members_bp)

    app.register_blueprint(borrowings_bp)

    app.register_blueprint(
        dashboard_bp,
        url_prefix="/api/dashboard"
    )

    app.register_blueprint(
        analytics_bp,
        url_prefix="/api/analytics"
    )

    app.register_blueprint(
        reports_bp,
        url_prefix="/api/reports"
    )

    app.register_blueprint(
        search_bp,
        url_prefix="/api/search"
    )

    app.register_blueprint(
        notifications_bp,
        url_prefix="/api/notifications"
    )

    app.register_blueprint(book_copies_bp)

    app.register_blueprint(returns_bp)
    app.register_blueprint(fines_bp)