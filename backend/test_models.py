from app import create_app
from app.extensions import db

from app.models import (
    User,
    Member,
    Author,
    Category,
    Book,
    BookCopy,
    Borrowing,
    Fine
)


app = create_app()


with app.app_context():

    print("Testing database connection...")

    db.session.execute(
        db.text("SELECT 1")
    )

    print("Database connected successfully!")

    print("\nTesting models...")

    print("User:", User.query.count())

    print("Members:", Member.query.count())

    print("Authors:", Author.query.count())

    print("Categories:", Category.query.count())

    print("Books:", Book.query.count())

    print("Book Copies:", BookCopy.query.count())

    print("Borrowings:", Borrowing.query.count())

    print("Fines:", Fine.query.count())

    print("\nAll models loaded successfully!")