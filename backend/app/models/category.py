from app.extensions import db


class Category(db.Model):
    __tablename__ = "categories"

    category_id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    description = db.Column(
        db.Text
    )

    books = db.relationship(
        "Book",
        back_populates="category"
    )

    def to_dict(self):
        return {
            "category_id": self.category_id,
            "name": self.name,
            "description": self.description
        }

    def __repr__(self):
        return f"<Category {self.name}>"