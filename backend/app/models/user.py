from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    username = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    role = db.Column(
        db.Enum("ADMIN", "LIBRARIAN"),
        nullable=False
    )

    status = db.Column(
        db.Enum("ACTIVE", "INACTIVE"),
        nullable=False,
        default="ACTIVE"
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )

    borrowings = db.relationship(
        "Borrowing",
        back_populates="issued_by_user",
        foreign_keys="Borrowing.issued_by"
    )

    def __repr__(self):
        return f"<User {self.username}>"