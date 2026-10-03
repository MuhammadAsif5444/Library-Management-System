import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Returns.css";

const API_URL = "http://127.0.0.1:5000/api";
const RETURNS_URL = `${API_URL}/returns/`;

export default function Returns() {
    const [returns, setReturns] = useState([]);
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

    const [editingReturn, setEditingReturn] = useState(null);
    const [returnToDelete, setReturnToDelete] = useState(null);

    const emptyForm = {
        borrowing_id: "",
        return_date: "",
        condition: "GOOD",
        notes: "",
    };

    const [form, setForm] = useState(emptyForm);

    const getToken = () => localStorage.getItem("access_token");

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const loadReturns = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                RETURNS_URL,
                authConfig()
            );

            const data =
                response.data?.returns ||
                response.data?.data ||
                response.data ||
                [];

            setReturns(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load returns:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to load returns."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadBorrowings = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/borrowings`,
                authConfig()
            );

            const data =
                response.data?.borrowings ||
                response.data?.data ||
                response.data ||
                [];

            setBorrowings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(
                "Failed to load borrowings:",
                err
            );
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
            console.error(
                "Failed to load members:",
                err
            );
        }
    };

    const loadBooks = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/books`,
                authConfig()
            );

            const data =
                response.data?.books ||
                response.data?.data ||
                response.data ||
                [];

            setBooks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(
                "Failed to load books:",
                err
            );
        }
    };

    useEffect(() => {
        loadReturns();
        loadBorrowings();
        loadMembers();
        loadBooks();
    }, []);

    const getBorrowing = (returnRecord) => {
        return (
            returnRecord.borrowing ||
            borrowings.find(
                (borrowing) =>
                    Number(borrowing.borrowing_id) ===
                    Number(returnRecord.borrowing_id)
            ) ||
            null
        );
    };

    const getMemberName = (returnRecord) => {
        const borrowing = getBorrowing(returnRecord);

        return (
            returnRecord.member?.name ||
            returnRecord.member_name ||
            borrowing?.member?.name ||
            borrowing?.member_name ||
            members.find(
                (member) =>
                    Number(member.member_id) ===
                    Number(
                        returnRecord.member_id ||
                            borrowing?.member_id
                    )
            )?.name ||
            "Unknown Member"
        );
    };

    const getStudentId = (returnRecord) => {
        const borrowing = getBorrowing(returnRecord);

        return (
            returnRecord.member?.student_id ||
            returnRecord.student_id ||
            borrowing?.member?.student_id ||
            borrowing?.student_id ||
            members.find(
                (member) =>
                    Number(member.member_id) ===
                    Number(
                        returnRecord.member_id ||
                            borrowing?.member_id
                    )
            )?.student_id ||
            "—"
        );
    };

    const getBookTitle = (returnRecord) => {
        const borrowing = getBorrowing(returnRecord);

        return (
            returnRecord.book?.title ||
            returnRecord.book_title ||
            borrowing?.book?.title ||
            borrowing?.book_title ||
            books.find(
                (book) =>
                    Number(book.book_id) ===
                    Number(
                        returnRecord.book_id ||
                            borrowing?.book_id
                    )
            )?.title ||
            "Unknown Book"
        );
    };

    const getBookISBN = (returnRecord) => {
        const borrowing = getBorrowing(returnRecord);

        return (
            returnRecord.book?.isbn ||
            returnRecord.isbn ||
            borrowing?.book?.isbn ||
            borrowing?.isbn ||
            books.find(
                (book) =>
                    Number(book.book_id) ===
                    Number(
                        returnRecord.book_id ||
                            borrowing?.book_id
                    )
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

    const filteredReturns = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return returns.filter((returnRecord) => {
            const borrowing = getBorrowing(returnRecord);

            const memberName = getMemberName(returnRecord);
            const studentId = getStudentId(returnRecord);
            const bookTitle = getBookTitle(returnRecord);

            const matchesSearch =
                !keyword ||
                String(returnRecord.return_id || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(returnRecord.borrowing_id || "")
                    .toLowerCase()
                    .includes(keyword) ||
                memberName.toLowerCase().includes(keyword) ||
                studentId.toLowerCase().includes(keyword) ||
                bookTitle.toLowerCase().includes(keyword) ||
                String(
                    borrowing?.book_id || ""
                ).includes(keyword);

            const status = String(
                returnRecord.status ||
                    returnRecord.condition ||
                    "RETURNED"
            ).toUpperCase();

            const matchesStatus =
                statusFilter === "ALL" ||
                status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [
        returns,
        borrowings,
        members,
        books,
        search,
        statusFilter,
    ]);

    const totalReturns = returns.length;

    const goodConditionCount = returns.filter(
        (returnRecord) =>
            String(
                returnRecord.condition || ""
            ).toUpperCase() === "GOOD"
    ).length;

    const damagedCount = returns.filter(
        (returnRecord) =>
            ["DAMAGED", "POOR"].includes(
                String(
                    returnRecord.condition || ""
                ).toUpperCase()
            )
    ).length;

    const returnedTodayCount = returns.filter(
        (returnRecord) => {
            if (!returnRecord.return_date) return false;

            const today = new Date();
            const returnDate = new Date(
                returnRecord.return_date
            );

            return (
                today.getFullYear() ===
                    returnDate.getFullYear() &&
                today.getMonth() ===
                    returnDate.getMonth() &&
                today.getDate() ===
                    returnDate.getDate()
            );
        }
    ).length;

    const openAddModal = () => {
        setEditingReturn(null);

        setForm({
            ...emptyForm,
            return_date: new Date()
                .toISOString()
                .slice(0, 10),
        });

        setError("");
        setShowModal(true);
    };

    const openEditModal = (returnRecord) => {
        setEditingReturn(returnRecord);

        setForm({
            borrowing_id:
                returnRecord.borrowing_id || "",
            return_date:
                returnRecord.return_date
                    ? String(
                          returnRecord.return_date
                      ).slice(0, 10)
                    : "",
            condition:
                returnRecord.condition ||
                "GOOD",
            notes:
                returnRecord.notes || "",
        });

        setError("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingReturn(null);
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

        if (!form.borrowing_id) {
            setError(
                "Please select a borrowing record."
            );
            return;
        }

        if (!form.return_date) {
            setError("Return date is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                borrowing_id: Number(
                    form.borrowing_id
                ),
                return_date: form.return_date,
                condition: form.condition,
                notes: form.notes.trim() || null,
            };

            if (editingReturn) {
                const response = await axios.put(
                    `${RETURNS_URL}/${editingReturn.return_id}`,
                    payload,
                    authConfig()
                );

                const updatedReturn =
                    response.data?.return ||
                    response.data?.data;

                if (updatedReturn) {
                    setReturns((previous) =>
                        previous.map((item) =>
                            item.return_id ===
                            editingReturn.return_id
                                ? updatedReturn
                                : item
                        )
                    );
                } else {
                    await loadReturns();
                }

                setSuccess(
                    "Return record updated successfully."
                );
            } else {
                const response = await axios.post(
                    RETURNS_URL,
                    payload,
                    authConfig()
                );

                const newReturn =
                    response.data?.return ||
                    response.data?.data;

                if (newReturn) {
                    setReturns((previous) => [
                        newReturn,
                        ...previous,
                    ]);
                } else {
                    await loadReturns();
                }

                setSuccess(
                    "Book return recorded successfully."
                );
            }

            setShowModal(false);
            setEditingReturn(null);
            setForm(emptyForm);
        } catch (err) {
            console.error(
                "Return save error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to save return record."
            );
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (returnRecord) => {
        setReturnToDelete(returnRecord);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setReturnToDelete(null);
    };

    const handleDelete = async () => {
        if (!returnToDelete) return;

        try {
            setError("");
            setSuccess("");

            await axios.delete(
                `${RETURNS_URL}/${returnToDelete.return_id}`,
                authConfig()
            );

            setReturns((previous) =>
                previous.filter(
                    (item) =>
                        item.return_id !==
                        returnToDelete.return_id
                )
            );

            setSuccess(
                "Return record deleted successfully."
            );

            closeDeleteModal();
        } catch (err) {
            console.error(
                "Return delete error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to delete return record."
            );
        }
    };

    return (
        <section className="returns-page">
            <div className="returns-header">
                <div>
                    <span className="returns-eyebrow">
                        CIRCULATION MANAGEMENT
                    </span>

                    <h1>Returns</h1>

                    <p>
                        Track returned books, return dates,
                        book condition and completed
                        circulation records.
                    </p>
                </div>

                <div className="returns-header-actions">
                    <button
                        className="returns-refresh-btn"
                        onClick={loadReturns}
                        disabled={loading}
                    >
                        <span>↻</span>
                        Refresh
                    </button>

                    <button
                        className="add-return-btn"
                        onClick={openAddModal}
                    >
                        <span>＋</span>
                        Record Return
                    </button>
                </div>
            </div>

            {success && (
                <div className="returns-success">
                    ✓ {success}
                </div>
            )}

            {error && !showModal && (
                <div className="returns-error">
                    ⚠️ {error}
                </div>
            )}

            <div className="return-stat-grid">
                <article className="return-stat-card">
                    <div className="return-stat-icon total">
                        ↩️
                    </div>

                    <div>
                        <span>Total Returns</span>

                        <strong>
                            {totalReturns.toLocaleString()}
                        </strong>

                        <small>completed return records</small>
                    </div>
                </article>

                <article className="return-stat-card">
                    <div className="return-stat-icon today">
                        📅
                    </div>

                    <div>
                        <span>Returned Today</span>

                        <strong>
                            {returnedTodayCount.toLocaleString()}
                        </strong>

                        <small>books returned today</small>
                    </div>
                </article>

                <article className="return-stat-card">
                    <div className="return-stat-icon good">
                        ✅
                    </div>

                    <div>
                        <span>Good Condition</span>

                        <strong>
                            {goodConditionCount.toLocaleString()}
                        </strong>

                        <small>books in good condition</small>
                    </div>
                </article>

                <article className="return-stat-card">
                    <div className="return-stat-icon damaged">
                        ⚠️
                    </div>

                    <div>
                        <span>Damaged / Poor</span>

                        <strong>
                            {damagedCount.toLocaleString()}
                        </strong>

                        <small>need attention</small>
                    </div>
                </article>
            </div>

            <div className="returns-card">
                <div className="returns-card-header">
                    <div>
                        <h2>Return Directory</h2>

                        <p>
                            Search and manage returned book
                            records.
                        </p>
                    </div>
                </div>

                <div className="returns-toolbar">
                    <div className="returns-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search by member, book, borrowing ID or return ID..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Returns
                        </option>

                        <option value="GOOD">
                            Good Condition
                        </option>

                        <option value="DAMAGED">
                            Damaged
                        </option>

                        <option value="POOR">
                            Poor Condition
                        </option>
                    </select>

                    <div className="returns-result-count">
                        {filteredReturns.length}{" "}
                        {filteredReturns.length === 1
                            ? "return"
                            : "returns"}
                    </div>
                </div>

                {loading ? (
                    <div className="returns-loading">
                        <div className="returns-spinner"></div>

                        <span>
                            Loading returns...
                        </span>
                    </div>
                ) : filteredReturns.length === 0 ? (
                    <div className="returns-empty">
                        <div className="returns-empty-icon">
                            ↩️
                        </div>

                        <h3>
                            {search
                                ? "No returns found"
                                : "No return records available"}
                        </h3>

                        <p>
                            {search
                                ? "Try a different search term."
                                : "Record your first book return to get started."}
                        </p>
                    </div>
                ) : (
                    <div className="returns-table-wrapper">
                        <table className="returns-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Member</th>
                                    <th>Book</th>
                                    <th>Borrowing ID</th>
                                    <th>Return Date</th>
                                    <th>Condition</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredReturns.map(
                                    (returnRecord) => {
                                        const condition =
                                            String(
                                                returnRecord.condition ||
                                                    "GOOD"
                                            ).toUpperCase();

                                        return (
                                            <tr
                                                key={
                                                    returnRecord.return_id
                                                }
                                            >
                                                <td>
                                                    <span className="return-id">
                                                        #
                                                        {
                                                            returnRecord.return_id
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="return-member-profile">
                                                        <div className="return-member-avatar">
                                                            {(
                                                                getMemberName(
                                                                    returnRecord
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
                                                                    returnRecord
                                                                )}
                                                            </strong>

                                                            <small>
                                                                {getStudentId(
                                                                    returnRecord
                                                                )}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="return-book-profile">
                                                        <strong>
                                                            {getBookTitle(
                                                                returnRecord
                                                            )}
                                                        </strong>

                                                        <small>
                                                            {getBookISBN(
                                                                returnRecord
                                                            )}
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="return-borrowing-id">
                                                        #
                                                        {
                                                            returnRecord.borrowing_id
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="return-date">
                                                        {formatDate(
                                                            returnRecord.return_date
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`return-condition return-condition-${condition.toLowerCase()}`}
                                                    >
                                                        <span className="return-condition-dot"></span>
                                                        {condition}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="return-notes">
                                                        {returnRecord.notes ||
                                                            "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="return-actions">
                                                        <button
                                                            className="return-edit-btn"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    returnRecord
                                                                )
                                                            }
                                                            title="Edit return"
                                                        >
                                                            ✏️
                                                        </button>

                                                        <button
                                                            className="return-delete-btn"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    returnRecord
                                                                )
                                                            }
                                                            title="Delete return"
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
                    className="return-modal-overlay"
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
                    <div className="return-modal">
                        <div className="return-modal-header">
                            <div className="return-modal-title">
                                <div className="return-modal-icon">
                                    ↩️
                                </div>

                                <div>
                                    <h2>
                                        {editingReturn
                                            ? "Edit Return"
                                            : "Record Book Return"}
                                    </h2>

                                    <p>
                                        {editingReturn
                                            ? "Update the return information."
                                            : "Record a returned library book."}
                                    </p>
                                </div>
                            </div>

                            <button
                                className="return-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="return-form-grid">
                                <div className="return-form-group full">
                                    <label>
                                        Borrowing Record *
                                    </label>

                                    <select
                                        name="borrowing_id"
                                        value={
                                            form.borrowing_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select borrowing
                                        </option>

                                        {borrowings.map(
                                            (borrowing) => (
                                                <option
                                                    key={
                                                        borrowing.borrowing_id
                                                    }
                                                    value={
                                                        borrowing.borrowing_id
                                                    }
                                                >
                                                    #
                                                    {
                                                        borrowing.borrowing_id
                                                    }
                                                    {" — "}
                                                    {getMemberName(
                                                        {
                                                            borrowing,
                                                        }
                                                    )}
                                                    {" — "}
                                                    {getBookTitle(
                                                        {
                                                            borrowing,
                                                        }
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="return-form-group">
                                    <label>
                                        Return Date *
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
                                        required
                                    />
                                </div>

                                <div className="return-form-group">
                                    <label>
                                        Book Condition
                                    </label>

                                    <select
                                        name="condition"
                                        value={
                                            form.condition
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="GOOD">
                                            Good
                                        </option>

                                        <option value="DAMAGED">
                                            Damaged
                                        </option>

                                        <option value="POOR">
                                            Poor
                                        </option>
                                    </select>
                                </div>

                                <div className="return-form-group full">
                                    <label>
                                        Notes
                                    </label>

                                    <textarea
                                        name="notes"
                                        value={
                                            form.notes
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Optional notes about the returned book..."
                                        rows="4"
                                    ></textarea>
                                </div>
                            </div>

                            {error && (
                                <div className="return-form-error">
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="return-modal-actions">
                                <button
                                    type="button"
                                    className="return-cancel-btn"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="return-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingReturn
                                        ? "Update Return"
                                        : "Record Return"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal &&
                returnToDelete && (
                    <div className="return-modal-overlay">
                        <div className="return-delete-modal">
                            <div className="return-delete-icon">
                                🗑️
                            </div>

                            <h2>
                                Delete Return Record?
                            </h2>

                            <p>
                                Are you sure you want to
                                delete return record{" "}
                                <strong>
                                    #
                                    {
                                        returnToDelete.return_id
                                    }
                                </strong>
                                ? This action cannot be
                                undone.
                            </p>

                            <div className="return-delete-actions">
                                <button
                                    className="return-delete-cancel"
                                    onClick={
                                        closeDeleteModal
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    className="return-delete-confirm"
                                    onClick={
                                        handleDelete
                                    }
                                >
                                    Delete Return
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </section>
    );
}