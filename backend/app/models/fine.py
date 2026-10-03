from app.extensions import db


class Fine(db.Model):
    __tablename__ = "fines"

    fine_id = db.Column(
        db.Integer,
        primary_key=True
    )

    borrowing_id = db.Column(
        db.Integer,
        db.ForeignKey("borrowings.borrowing_id"),
        unique=True,
        nullable=False
    )

    amount = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0.00
    )

    reason = db.Column(
        db.String(255)
    )

    days_overdue = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    status = db.Column(
        db.Enum(
            "UNPAID",
            "PAID",
            "WAIVED"
        ),
        nullable=False,
        default="UNPAID"
    )

    paid_at = db.Column(
        db.DateTime
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

    borrowing = db.relationship(
        "Borrowing",
        back_populates="fine"
    )

    def __repr__(self):
        return f"<Fine {self.fine_id}>"