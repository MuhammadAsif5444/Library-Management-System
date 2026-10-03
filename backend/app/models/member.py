from app.extensions import db


class Member(db.Model):
    __tablename__ = "members"

    member_id = db.Column(
        db.Integer,
        primary_key=True
    )

    student_id = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(100),
        unique=True
    )

    phone = db.Column(
        db.String(20)
    )

    address = db.Column(
        db.String(255)
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    status = db.Column(
        db.Enum("ACTIVE", "INACTIVE"),
        nullable=False,
        default="ACTIVE"
    )

    registered_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )

    # ---------------------------------------------------------
    # Relationship with Borrowing
    # ---------------------------------------------------------
    borrowings = db.relationship(
        "Borrowing",
        back_populates="member"
    )

    # ---------------------------------------------------------
    # Convert Member object to dictionary
    # ---------------------------------------------------------
    def to_dict(self):
        return {
            "member_id": self.member_id,
            "student_id": self.student_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "status": self.status,
            "registered_at": (
                self.registered_at.isoformat()
                if self.registered_at
                else None
            )
        }

    # ---------------------------------------------------------
    # String representation
    # ---------------------------------------------------------
    def __repr__(self):
        return f"<Member {self.name}>"