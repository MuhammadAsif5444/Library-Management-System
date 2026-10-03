import csv
from datetime import date
from io import StringIO

from flask import Blueprint, jsonify, make_response

from app.models.book import Book
from app.models.member import Member
from app.models.borrowing import Borrowing
from app.models.fine import Fine
from app.utils.decorators import role_required


reports_bp = Blueprint("reports", __name__)


def create_csv_response(data, filename):
    output = StringIO()

    if not data:
        writer = csv.writer(output)
        writer.writerow(["No data available"])
    else:
        fieldnames = data[0].keys()

        writer = csv.DictWriter(
            output,
            fieldnames=fieldnames
        )

        writer.writeheader()
        writer.writerows(data)

    response = make_response(output.getvalue())

    response.headers[
        "Content-Disposition"
    ] = f"attachment; filename={filename}"

    response.headers[
        "Content-Type"
    ] = "text/csv"

    return response


# =====================================================
# BOOKS REPORT
# =====================================================

@reports_bp.route("/books", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def books_report():

    books = Book.query.all()

    report = []

    for book in books:
        report.append({
            "book_id": book.book_id,
            "isbn": book.isbn,
            "title": book.title,
            "publisher": book.publisher,
            "publication_year": book.publication_year,
            "total_copies": book.total_copies,
            "available_copies": book.available_copies,
            "shelf_location": book.shelf_location,
            "status": book.status
        })

    return jsonify({
        "success": True,
        "total_books": len(report),
        "data": report
    }), 200


# =====================================================
# BOOKS CSV EXPORT
# =====================================================

@reports_bp.route("/books/export", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def export_books():

    books = Book.query.all()

    data = []

    for book in books:
        data.append({
            "Book ID": book.book_id,
            "ISBN": book.isbn,
            "Title": book.title,
            "Publisher": book.publisher,
            "Publication Year": book.publication_year,
            "Total Copies": book.total_copies,
            "Available Copies": book.available_copies,
            "Shelf Location": book.shelf_location,
            "Status": book.status
        })

    return create_csv_response(
        data,
        "books_report.csv"
    )


# =====================================================
# MEMBERS REPORT
# =====================================================

@reports_bp.route("/members", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def members_report():

    members = Member.query.all()

    report = []

    for member in members:
        report.append({
            "member_id": member.member_id,
            "student_id": member.student_id,
            "name": member.name,
            "email": member.email,
            "phone": member.phone,
            "address": member.address,
            "status": member.status,
            "registered_at": str(member.registered_at)
        })

    return jsonify({
        "success": True,
        "total_members": len(report),
        "data": report
    }), 200


# =====================================================
# MEMBERS CSV EXPORT
# =====================================================

@reports_bp.route("/members/export", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def export_members():

    members = Member.query.all()

    data = []

    for member in members:
        data.append({
            "Member ID": member.member_id,
            "Student ID": member.student_id,
            "Name": member.name,
            "Email": member.email,
            "Phone": member.phone,
            "Address": member.address,
            "Status": member.status,
            "Registered At": member.registered_at
        })

    return create_csv_response(
        data,
        "members_report.csv"
    )


# =====================================================
# BORROWINGS REPORT
# =====================================================

@reports_bp.route("/borrowings", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def borrowings_report():

    borrowings = Borrowing.query.all()

    report = []

    for borrowing in borrowings:

        report.append({
            "borrowing_id": borrowing.borrowing_id,
            "member_id": borrowing.member_id,
            "book_id": borrowing.book_id,
            "copy_id": borrowing.copy_id,
            "issue_date": str(borrowing.issue_date),
            "due_date": str(borrowing.due_date),
            "return_date": (
                str(borrowing.return_date)
                if borrowing.return_date
                else None
            ),
            "status": borrowing.status,
            "renewal_count": borrowing.renewal_count
        })

    return jsonify({
        "success": True,
        "total_borrowings": len(report),
        "data": report
    }), 200


# =====================================================
# BORROWINGS CSV EXPORT
# =====================================================

@reports_bp.route("/borrowings/export", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def export_borrowings():

    borrowings = Borrowing.query.all()

    data = []

    for borrowing in borrowings:

        data.append({
            "Borrowing ID": borrowing.borrowing_id,
            "Member ID": borrowing.member_id,
            "Book ID": borrowing.book_id,
            "Copy ID": borrowing.copy_id,
            "Issue Date": borrowing.issue_date,
            "Due Date": borrowing.due_date,
            "Return Date": borrowing.return_date,
            "Status": borrowing.status,
            "Renewal Count": borrowing.renewal_count
        })

    return create_csv_response(
        data,
        "borrowings_report.csv"
    )


# =====================================================
# OVERDUE REPORT
# =====================================================

@reports_bp.route("/overdue", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def overdue_report():

    today = date.today()

    borrowings = Borrowing.query.filter(
        Borrowing.return_date.is_(None),
        Borrowing.due_date < today
    ).all()

    report = []

    for borrowing in borrowings:

        days_overdue = (
            today - borrowing.due_date
        ).days

        report.append({
            "borrowing_id": borrowing.borrowing_id,
            "member_id": borrowing.member_id,
            "book_id": borrowing.book_id,
            "copy_id": borrowing.copy_id,
            "issue_date": str(borrowing.issue_date),
            "due_date": str(borrowing.due_date),
            "days_overdue": days_overdue,
            "status": borrowing.status
        })

    return jsonify({
        "success": True,
        "total_overdue": len(report),
        "data": report
    }), 200


# =====================================================
# OVERDUE CSV EXPORT
# =====================================================

@reports_bp.route("/overdue/export", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def export_overdue():

    today = date.today()

    borrowings = Borrowing.query.filter(
        Borrowing.return_date.is_(None),
        Borrowing.due_date < today
    ).all()

    data = []

    for borrowing in borrowings:

        days_overdue = (
            today - borrowing.due_date
        ).days

        data.append({
            "Borrowing ID": borrowing.borrowing_id,
            "Member ID": borrowing.member_id,
            "Book ID": borrowing.book_id,
            "Copy ID": borrowing.copy_id,
            "Issue Date": borrowing.issue_date,
            "Due Date": borrowing.due_date,
            "Days Overdue": days_overdue,
            "Status": borrowing.status
        })

    return create_csv_response(
        data,
        "overdue_report.csv"
    )


# =====================================================
# FINES REPORT
# =====================================================

@reports_bp.route("/fines", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def fines_report():

    fines = Fine.query.all()

    report = []

    for fine in fines:

        report.append({
            "fine_id": fine.fine_id,
            "borrowing_id": fine.borrowing_id,
            "amount": float(fine.amount),
            "reason": fine.reason,
            "days_overdue": fine.days_overdue,
            "status": fine.status,
            "paid_at": (
                str(fine.paid_at)
                if fine.paid_at
                else None
            )
        })

    return jsonify({
        "success": True,
        "total_fines": len(report),
        "data": report
    }), 200


# =====================================================
# FINES CSV EXPORT
# =====================================================

@reports_bp.route("/fines/export", methods=["GET"])
@role_required("ADMIN", "LIBRARIAN")
def export_fines():

    fines = Fine.query.all()

    data = []

    for fine in fines:

        data.append({
            "Fine ID": fine.fine_id,
            "Borrowing ID": fine.borrowing_id,
            "Amount": fine.amount,
            "Reason": fine.reason,
            "Days Overdue": fine.days_overdue,
            "Status": fine.status,
            "Paid At": fine.paid_at
        })

    return create_csv_response(
        data,
        "fines_report.csv"
    )