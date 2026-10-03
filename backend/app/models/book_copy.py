from app.extensions import db


class BookCopy(db.Model):
    __tablename__ = "book_copies"

    copy_id = db.Column(
        db.Integer,
        primary_key=True
    )

    book_id = db.Column(
        db.Integer,
        db.ForeignKey("books.book_id"),
        nullable=False
    )

    accession_number = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    shelf_location = db.Column(
        db.String(100)
    )

    status = db.Column(
        db.Enum(
            "AVAILABLE",
            "BORROWED",
            "LOST",
            "DAMAGED",
            "MAINTENANCE"
        ),
        nullable=False,
        default="AVAILABLE"
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp()
    )

    book = db.relationship(
        "Book",
        back_populates="copies"
    )

    borrowings = db.relationship(
        "Borrowing",
        back_populates="copy"
    )

    def __repr__(self):
        return f"<BookCopy {self.accession_number}>"