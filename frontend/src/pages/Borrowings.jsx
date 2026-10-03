import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Borrowings.css";

const API_URL = "http://127.0.0.1:5000/api";
const BORROWINGS_URL = `${API_URL}/borrowings/`;

export default function Borrowings() {
    const [borrowings, setBorrowings] = useState([]);
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [editingBorrowing, setEditingBorrowing] = useState(null);
    const [borrowingToDelete, setBorrowingToDelete] = useState(null);

    const emptyForm = {
        member_id: "",
        book_id: "",
        borrow_date: "",
        due_date: "",
        return_date: "",
        status: "BORROWED",
    };

    const [form, setForm] = useState(emptyForm);

    const getToken = () => localStorage.getItem("access_token");

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const loadBorrowings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                BORROWINGS_URL,
                authConfig()
            );

            const data =
                response.data?.borrowings ||
                response.data?.data ||
                response.data ||
                [];

            setBorrowings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load borrowings:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to load borrowings."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/members`,
                authConfig()
            );

            const data =
                response.data?.members ||
                response.data?.data ||
                response.data ||
                [];

            setMembers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load members:", err);
        }
    };

    const loadBooks = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/books/`,
                authConfig()
            );

            const data =
                response.data?.books ||
                response.data?.data ||
                response.data ||
                [];

            setBooks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load books:", err);
        }
    };

    useEffect(() => {
        loadBorrowings();
        loadMembers();
        loadBooks();
    }, []);

    const getMemberName = (borrowing) => {
        return (
            borrowing.member?.name ||
            borrowing.member_name ||
            members.find(
                (member) =>
                    Number(member.member_id) ===
                    Number(borrowing.member_id)
            )?.name ||
            "Unknown Member"
        );
    };

    const getStudentId = (borrowing) => {
        return (
            borrowing.member?.student_id ||
            borrowing.student_id ||
            members.find(
                (member) =>
                    Number(member.member_id) ===
                    Number(borrowing.member_id)
            )?.student_id ||
            "—"
        );
    };

    const getBookTitle = (borrowing) => {
        return (
            borrowing.book?.title ||
            borrowing.book_title ||
            books.find(
                (book) =>
                    Number(book.book_id) ===
                    Number(borrowing.book_id)
            )?.title ||
            "Unknown Book"
        );
    };

    const getBookISBN = (borrowing) => {
        return (
            borrowing.book?.isbn ||
            borrowing.isbn ||
            books.find(
                (book) =>
                    Number(book.book_id) ===
                    Number(borrowing.book_id)
            )?.isbn ||
            "—"
        );
    };

    const formatDate = (value) => {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value).split("T")[0];
        }

        return date.toLocaleDateString();
    };

    const filteredBorrowings = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return borrowings.filter((borrowing) => {
            const memberName =
                borrowing.member?.name ||
                borrowing.member_name ||
                members.find(
                    (member) =>
                        Number(member.member_id) ===
                        Number(borrowing.member_id)
                )?.name ||
                "";

            const studentId =
                borrowing.member?.student_id ||
                borrowing.student_id ||
                members.find(
                    (member) =>
                        Number(member.member_id) ===
                        Number(borrowing.member_id)
                )?.student_id ||
                "";

            const bookTitle =
                borrowing.book?.title ||
                borrowing.book_title ||
                books.find(
                    (book) =>
                        Number(book.book_id) ===
                        Number(borrowing.book_id)
                )?.title ||
                "";

            const matchesSearch =
                !keyword ||
                String(borrowing.borrowing_id || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(borrowing.member_id || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(borrowing.book_id || "")
                    .toLowerCase()
                    .includes(keyword) ||
                memberName.toLowerCase().includes(keyword) ||
                studentId.toLowerCase().includes(keyword) ||
                bookTitle.toLowerCase().includes(keyword);

            const matchesStatus =
                statusFilter === "ALL" ||
                String(borrowing.status || "").toUpperCase() ===
                    statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [
        borrowings,
        members,
        books,
        search,
        statusFilter,
    ]);

    const borrowedCount = borrowings.filter(
        (borrowing) =>
            String(borrowing.status || "").toUpperCase() ===
            "BORROWED"
    ).length;

    const overdueCount = borrowings.filter(
        (borrowing) =>
            String(borrowing.status || "").toUpperCase() ===
            "OVERDUE"
    ).length;

    const returnedCount = borrowings.filter(
        (borrowing) =>
            String(borrowing.status || "").toUpperCase() ===
            "RETURNED"
    ).length;

    const openAddModal = () => {
        setEditingBorrowing(null);
        setForm(emptyForm);
        setError("");
        setShowModal(true);
    };

    const openEditModal = (borrowing) => {
        setEditingBorrowing(borrowing);

        setForm({
            member_id:
                borrowing.member_id ||
                borrowing.member?.member_id ||
                "",
            book_id:
                borrowing.book_id ||
                borrowing.book?.book_id ||
                "",
            borrow_date:
                borrowing.borrow_date
                    ? String(borrowing.borrow_date).slice(0, 10)
                    : "",
            due_date:
                borrowing.due_date
                    ? String(borrowing.due_date).slice(0, 10)
                    : "",
            return_date:
                borrowing.return_date
                    ? String(borrowing.return_date).slice(0, 10)
                    : "",
            status:
                borrowing.status ||
                "BORROWED",
        });

        setError("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingBorrowing(null);
        setForm(emptyForm);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.member_id) {
            setError("Please select a member.");
            return;
        }

        if (!form.book_id) {
            setError("Please select a book.");
            return;
        }

        if (!form.borrow_date) {
            setError("Borrow date is required.");
            return;
        }

        if (!form.due_date) {
            setError("Due date is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                member_id: Number(form.member_id),
                book_id: Number(form.book_id),
                borrow_date: form.borrow_date,
                due_date: form.due_date,
                return_date: form.return_date || null,
                status: form.status,
            };

            if (editingBorrowing) {
                const response = await axios.put(
                    `${BORROWINGS_URL}/${editingBorrowing.borrowing_id}`,
                    payload,
                    authConfig()
                );

                const updatedBorrowing =
                    response.data?.borrowing;

                if (updatedBorrowing) {
                    setBorrowings((previous) =>
                        previous.map((borrowing) =>
                            borrowing.borrowing_id ===
                            editingBorrowing.borrowing_id
                                ? updatedBorrowing
                                : borrowing
                        )
                    );
                } else {
                    await loadBorrowings();
                }

                setSuccess(
                    "Borrowing updated successfully."
                );
            } else {
                const response = await axios.post(
                    BORROWINGS_URL,
                    payload,
                    authConfig()
                );

                const newBorrowing =
                    response.data?.borrowing;

                if (newBorrowing) {
                    setBorrowings((previous) => [
                        newBorrowing,
                        ...previous,
                    ]);
                } else {
                    await loadBorrowings();
                }

                setSuccess(
                    "Borrowing created successfully."
                );
            }

            setShowModal(false);
            setEditingBorrowing(null);
            setForm(emptyForm);
        } catch (err) {
            console.error("Borrowing save error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to save borrowing."
            );
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (borrowing) => {
        setBorrowingToDelete(borrowing);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setBorrowingToDelete(null);
    };

    const handleDelete = async () => {
        if (!borrowingToDelete) return;

        try {
            setError("");
            setSuccess("");

            await axios.delete(
                `${BORROWINGS_URL}/${borrowingToDelete.borrowing_id}`,
                authConfig()
            );

            setBorrowings((previous) =>
                previous.filter(
                    (borrowing) =>
                        borrowing.borrowing_id !==
                        borrowingToDelete.borrowing_id
                )
            );

            setSuccess(
                "Borrowing deleted successfully."
            );

            closeDeleteModal();
        } catch (err) {
            console.error("Borrowing delete error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to delete borrowing."
            );
        }
    };

    return (
        <section className="borrowings-page">
            <div className="borrowings-header">
                <div>
                    <span className="borrowings-eyebrow">
                        CIRCULATION MANAGEMENT
                    </span>

                    <h1>Borrowings</h1>

                    <p>
                        Track issued books, due dates,
                        returns and overdue borrowing records.
                    </p>
                </div>

                <div className="borrowings-header-actions">
                    <button
                        className="borrowings-refresh-btn"
                        onClick={loadBorrowings}
                        disabled={loading}
                    >
                        <span>↻</span>
                        Refresh
                    </button>

                    <button
                        className="add-borrowing-btn"
                        onClick={openAddModal}
                    >
                        <span>＋</span>
                        New Borrowing
                    </button>
                </div>
            </div>

            {success && (
                <div className="borrowings-success">
                    ✓ {success}
                </div>
            )}

            {error && !showModal && (
                <div className="borrowings-error">
                    ⚠️ {error}
                </div>
            )}

            <div className="borrowing-stat-grid">
                <article className="borrowing-stat-card">
                    <div className="borrowing-stat-icon total">
                        📋
                    </div>

                    <div>
                        <span>Total Borrowings</span>
                        <strong>
                            {borrowings.length.toLocaleString()}
                        </strong>
                        <small>circulation records</small>
                    </div>
                </article>

                <article className="borrowing-stat-card">
                    <div className="borrowing-stat-icon borrowed">
                        📚
                    </div>

                    <div>
                        <span>Currently Borrowed</span>
                        <strong>
                            {borrowedCount.toLocaleString()}
                        </strong>
                        <small>active loans</small>
                    </div>
                </article>

                <article className="borrowing-stat-card">
                    <div className="borrowing-stat-icon overdue">
                        ⚠️
                    </div>

                    <div>
                        <span>Overdue</span>
                        <strong>
                            {overdueCount.toLocaleString()}
                        </strong>
                        <small>past due date</small>
                    </div>
                </article>

                <article className="borrowing-stat-card">
                    <div className="borrowing-stat-icon returned">
                        ✅
                    </div>

                    <div>
                        <span>Returned</span>
                        <strong>
                            {returnedCount.toLocaleString()}
                        </strong>
                        <small>completed loans</small>
                    </div>
                </article>
            </div>

            <div className="borrowings-card">
                <div className="borrowings-card-header">
                    <div>
                        <h2>Borrowing Directory</h2>
                        <p>
                            Search and manage library
                            circulation records.
                        </p>
                    </div>
                </div>

                <div className="borrowings-toolbar">
                    <div className="borrowings-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search by member, student ID, book or borrowing ID..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="ALL">
                            All Status
                        </option>

                        <option value="BORROWED">
                            Borrowed
                        </option>

                        <option value="OVERDUE">
                            Overdue
                        </option>

                        <option value="RETURNED">
                            Returned
                        </option>
                    </select>

                    <div className="borrowings-result-count">
                        {filteredBorrowings.length}{" "}
                        {filteredBorrowings.length === 1
                            ? "record"
                            : "records"}
                    </div>
                </div>

                {loading ? (
                    <div className="borrowings-loading">
                        <div className="borrowings-spinner"></div>

                        <span>
                            Loading borrowings...
                        </span>
                    </div>
                ) : filteredBorrowings.length === 0 ? (
                    <div className="borrowings-empty">
                        <div className="borrowings-empty-icon">
                            📋
                        </div>

                        <h3>
                            {search
                                ? "No borrowings found"
                                : "No borrowing records available"}
                        </h3>

                        <p>
                            {search
                                ? "Try a different search term."
                                : "Create your first borrowing record to get started."}
                        </p>
                    </div>
                ) : (
                    <div className="borrowings-table-wrapper">
                        <table className="borrowings-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Member</th>
                                    <th>Book</th>
                                    <th>Borrow Date</th>
                                    <th>Due Date</th>
                                    <th>Return Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBorrowings.map(
                                    (borrowing) => {
                                        const status =
                                            String(
                                                borrowing.status ||
                                                    "BORROWED"
                                            ).toUpperCase();

                                        return (
                                            <tr
                                                key={
                                                    borrowing.borrowing_id
                                                }
                                            >
                                                <td>
                                                    <span className="borrowing-id">
                                                        #
                                                        {
                                                            borrowing.borrowing_id
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="borrowing-member-profile">
                                                        <div className="borrowing-member-avatar">
                                                            {(
                                                                getMemberName(
                                                                    borrowing
                                                                ) ||
                                                                "M"
                                                            )
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {getMemberName(
                                                                    borrowing
                                                                )}
                                                            </strong>

                                                            <small>
                                                                {getStudentId(
                                                                    borrowing
                                                                )}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="borrowing-book-profile">
                                                        <strong>
                                                            {getBookTitle(
                                                                borrowing
                                                            )}
                                                        </strong>

                                                        <small>
                                                            {
                                                                getBookISBN(
                                                                    borrowing
                                                                )
                                                            }
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="borrowing-date">
                                                        {formatDate(
                                                            borrowing.borrow_date
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="borrowing-date due">
                                                        {formatDate(
                                                            borrowing.due_date
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="borrowing-date">
                                                        {formatDate(
                                                            borrowing.return_date
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`borrowing-status borrowing-status-${status.toLowerCase()}`}
                                                    >
                                                        <span className="borrowing-status-dot"></span>
                                                        {status}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="borrowing-actions">
                                                        <button
                                                            className="borrowing-edit-btn"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    borrowing
                                                                )
                                                            }
                                                            title="Edit borrowing"
                                                        >
                                                            ✏️
                                                        </button>

                                                        <button
                                                            className="borrowing-delete-btn"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    borrowing
                                                                )
                                                            }
                                                            title="Delete borrowing"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div
                    className="borrowing-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                                event.currentTarget &&
                            !saving
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <div className="borrowing-modal">
                        <div className="borrowing-modal-header">
                            <div className="borrowing-modal-title">
                                <div className="borrowing-modal-icon">
                                    📋
                                </div>

                                <div>
                                    <h2>
                                        {editingBorrowing
                                            ? "Edit Borrowing"
                                            : "New Borrowing"}
                                    </h2>

                                    <p>
                                        {editingBorrowing
                                            ? "Update the borrowing record."
                                            : "Create a new book borrowing record."}
                                    </p>
                                </div>
                            </div>

                            <button
                                className="borrowing-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="borrowing-form-grid">
                                <div className="borrowing-form-group full">
                                    <label>
                                        Member *
                                    </label>

                                    <select
                                        name="member_id"
                                        value={form.member_id}
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select member
                                        </option>

                                        {members.map(
                                            (member) => (
                                                <option
                                                    key={
                                                        member.member_id
                                                    }
                                                    value={
                                                        member.member_id
                                                    }
                                                >
                                                    {
                                                        member.name
                                                    }
                                                    {" — "}
                                                    {
                                                        member.student_id
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="borrowing-form-group full">
                                    <label>
                                        Book *
                                    </label>

                                    <select
                                        name="book_id"
                                        value={form.book_id}
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select book
                                        </option>

                                        {books.map(
                                            (book) => (
                                                <option
                                                    key={
                                                        book.book_id
                                                    }
                                                    value={
                                                        book.book_id
                                                    }
                                                >
                                                    {
                                                        book.title
                                                    }
                                                    {" — "}
                                                    {book.isbn ||
                                                        "No ISBN"}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="borrowing-form-group">
                                    <label>
                                        Borrow Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="borrow_date"
                                        value={
                                            form.borrow_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />
                                </div>

                                <div className="borrowing-form-group">
                                    <label>
                                        Due Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="due_date"
                                        value={
                                            form.due_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />
                                </div>

                                <div className="borrowing-form-group">
                                    <label>
                                        Return Date
                                    </label>

                                    <input
                                        type="date"
                                        name="return_date"
                                        value={
                                            form.return_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />
                                </div>

                                <div className="borrowing-form-group">
                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            form.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="BORROWED">
                                            Borrowed
                                        </option>

                                        <option value="OVERDUE">
                                            Overdue
                                        </option>

                                        <option value="RETURNED">
                                            Returned
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {error && (
                                <div className="borrowing-form-error">
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="borrowing-modal-actions">
                                <button
                                    type="button"
                                    className="borrowing-cancel-btn"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="borrowing-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingBorrowing
                                        ? "Update Borrowing"
                                        : "Create Borrowing"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal &&
                borrowingToDelete && (
                    <div className="borrowing-modal-overlay">
                        <div className="borrowing-delete-modal">
                            <div className="borrowing-delete-icon">
                                🗑️
                            </div>

                            <h2>
                                Delete Borrowing?
                            </h2>

                            <p>
                                Are you sure you want to
                                delete borrowing{" "}
                                <strong>
                                    #
                                    {
                                        borrowingToDelete.borrowing_id
                                    }
                                </strong>
                                ? This action cannot be
                                undone.
                            </p>

                            <div className="borrowing-delete-actions">
                                <button
                                    className="borrowing-delete-cancel"
                                    onClick={
                                        closeDeleteModal
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    className="borrowing-delete-confirm"
                                    onClick={
                                        handleDelete
                                    }
                                >
                                    Delete Borrowing
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </section>
    );
}