from app.extensions import db


class Book(db.Model):
    __tablename__ = "books"

    book_id = db.Column(
        db.Integer,
        primary_key=True
    )

    isbn = db.Column(
        db.String(20),
        unique=True,
        nullable=False
    )

    title = db.Column(
        db.String(255),
        nullable=False
    )

    author_id = db.Column(
        db.Integer,
        db.ForeignKey("authors.author_id"),
        nullable=False
    )

    category_id = db.Column(
        db.Integer,
        db.ForeignKey("categories.category_id"),
        nullable=False
    )

    publisher = db.Column(
        db.String(150)
    )

    publication_year = db.Column(
        db.Integer
    )

    total_copies = db.Column(
        db.Integer,
        nullable=False,
        default=1
    )

    available_copies = db.Column(
        db.Integer,
        nullable=False,
        default=1
    )

    shelf_location = db.Column(
        db.String(50)
    )

    status = db.Column(
        db.Enum(
            "AVAILABLE",
            "UNAVAILABLE",
            "INACTIVE"
        ),
        nullable=False,
        default="AVAILABLE"
    )

    author = db.relationship(
        "Author",
        back_populates="books"
    )

    category = db.relationship(
        "Category",
        back_populates="books"
    )

    copies = db.relationship(
        "BookCopy",
        back_populates="book"
    )

    borrowings = db.relationship(
        "Borrowing",
        back_populates="book"
    )

    def to_dict(self):
        return {
            "book_id": self.book_id,
            "isbn": self.isbn,
            "title": self.title,
            "author_id": self.author_id,
            "author_name": (
                self.author.name
                if self.author else None
            ),
            "category_id": self.category_id,
            "category_name": (
                self.category.name
                if self.category else None
            ),
            "publisher": self.publisher,
            "publication_year": self.publication_year,
            "total_copies": self.total_copies,
            "available_copies": self.available_copies,
            "shelf_location": self.shelf_location,
            "status": self.status
        }

    def __repr__(self):
        return f"<Book {self.title}>"