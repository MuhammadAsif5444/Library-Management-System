from app.extensions import db


class Borrowing(db.Model):
    __tablename__ = "borrowings"

    borrowing_id = db.Column(
        db.Integer,
        primary_key=True
    )

    member_id = db.Column(
        db.Integer,
        db.ForeignKey("members.member_id"),
        nullable=False
    )

    book_id = db.Column(
        db.Integer,
        db.ForeignKey("books.book_id"),
        nullable=False
    )

    copy_id = db.Column(
        db.Integer,
        db.ForeignKey("book_copies.copy_id"),
        nullable=True
    )

    issued_by = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    issue_date = db.Column(
        db.Date,
        nullable=False
    )

    due_date = db.Column(
        db.Date,
        nullable=False
    )

    return_date = db.Column(
        db.Date
    )

    status = db.Column(
        db.Enum(
            "BORROWED",
            "RETURNED",
            "OVERDUE"
        ),
        nullable=False,
        default="BORROWED"
    )

    renewal_count = db.Column(
        db.Integer,
        nullable=False,
        default=0
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

    member = db.relationship(
        "Member",
        back_populates="borrowings"
    )

    book = db.relationship(
        "Book",
        back_populates="borrowings"
    )

    copy = db.relationship(
        "BookCopy",
        back_populates="borrowings"
    )

    issued_by_user = db.relationship(
        "User",
        back_populates="borrowings",
        foreign_keys=[issued_by]
    )

    fine = db.relationship(
        "Fine",
        back_populates="borrowing",
        uselist=False
    )

    def __repr__(self):
        return f"<Borrowing {self.borrowing_id}>"