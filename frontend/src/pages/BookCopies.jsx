import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./BookCopies.css";

const API_URL = "http://127.0.0.1:5000/api";
const BOOK_COPIES_URL = `${API_URL}/book-copies`;

export default function BookCopies() {
    const [copies, setCopies] = useState([]);
    const [books, setBooks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [editingCopy, setEditingCopy] = useState(null);
    const [deletingCopy, setDeletingCopy] = useState(null);

    const emptyForm = {
        book_id: "",
        accession_number: "",
        shelf_location: "",
        status: "AVAILABLE",
    };

    const [form, setForm] = useState(emptyForm);

    // =========================
    // AUTH
    // =========================

    const getToken = () => {
        return localStorage.getItem("access_token");
    };

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    // =========================
    // LOAD BOOK COPIES
    // =========================

    const loadCopies = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                BOOK_COPIES_URL,
                authConfig()
            );

            console.log(
                "Book copies API response:",
                response.data
            );

            const data =
                response.data?.book_copies || [];

            setCopies(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "Failed to load book copies:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to load book copies."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOAD BOOKS
    // =========================

    const loadBooks = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/books/`,
                authConfig()
            );

            console.log(
                "Books API response:",
                response.data
            );

            const data =
                response.data?.books ||
                response.data?.data ||
                response.data ||
                [];

            setBooks(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "Failed to load books:",
                err
            );
        }
    };

    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {
        loadCopies();
        loadBooks();
    }, []);

    // =========================
    // BOOK HELPERS
    // =========================

    const getBookTitle = (copy) => {
        return (
            copy.book_title ||
            copy.book?.title ||
            books.find(
                (book) =>
                    Number(book.book_id) ===
                    Number(copy.book_id)
            )?.title ||
            "Unknown Book"
        );
    };

    const getBookISBN = (copy) => {
        return (
            copy.isbn ||
            copy.book?.isbn ||
            books.find(
                (book) =>
                    Number(book.book_id) ===
                    Number(copy.book_id)
            )?.isbn ||
            "—"
        );
    };

    const getAccessionNumber = (copy) => {
        return (
            copy.accession_number ||
            "—"
        );
    };

    // =========================
    // FILTERED COPIES
    // =========================

    const filteredCopies = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        return copies.filter((copy) => {
            const bookTitle =
                getBookTitle(copy);

            const accessionNumber =
                getAccessionNumber(copy);

            const matchesSearch =
                !keyword ||
                String(copy.copy_id || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(copy.book_id || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(accessionNumber || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(bookTitle || "")
                    .toLowerCase()
                    .includes(keyword);

            const copyStatus =
                String(
                    copy.status || ""
                ).toUpperCase();

            const matchesStatus =
                statusFilter === "ALL" ||
                copyStatus === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        copies,
        books,
        search,
        statusFilter,
    ]);

    // =========================
    // STATISTICS
    // =========================

    const totalCopies = copies.length;

    const availableCount = copies.filter(
        (copy) =>
            String(
                copy.status || ""
            ).toUpperCase() === "AVAILABLE"
    ).length;

    const borrowedCount = copies.filter(
        (copy) =>
            String(
                copy.status || ""
            ).toUpperCase() === "BORROWED"
    ).length;

    const unavailableCount = copies.filter(
        (copy) =>
            String(
                copy.status || ""
            ).toUpperCase() === "UNAVAILABLE"
    ).length;

    // =========================
    // OPEN ADD MODAL
    // =========================

    const openAddModal = () => {
        setEditingCopy(null);

        setForm({
            ...emptyForm,
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    };

    // =========================
    // OPEN EDIT MODAL
    // =========================

    const openEditModal = (copy) => {
        setEditingCopy(copy);

        setForm({
            book_id: copy.book_id
                ? String(copy.book_id)
                : "",
            accession_number:
                copy.accession_number || "",
            shelf_location:
                copy.shelf_location || "",
            status:
                copy.status || "AVAILABLE",
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    };

    // =========================
    // CLOSE MODAL
    // =========================

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingCopy(null);

        setForm({
            ...emptyForm,
        });

        setError("");
    };

    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================
    // SAVE BOOK COPY
    // =========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        // Validate book
        if (!form.book_id) {
            setError(
                "Please select a book."
            );
            return;
        }

        // Validate accession number
        const accessionNumber =
            String(
                form.accession_number || ""
            ).trim();

        if (!accessionNumber) {
            setError(
                "Accession number is required."
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                book_id: Number(
                    form.book_id
                ),
                accession_number:
                    accessionNumber,
                shelf_location:
                    form.shelf_location
                        ? String(
                              form.shelf_location
                          ).trim()
                        : null,
                status:
                    form.status ||
                    "AVAILABLE",
            };

            console.log(
                editingCopy
                    ? "Updating book copy:"
                    : "Creating book copy:",
                payload
            );

            // =========================
            // EDIT
            // =========================

            if (editingCopy) {
                const response =
                    await axios.put(
                        `${BOOK_COPIES_URL}/${editingCopy.copy_id}`,
                        payload,
                        authConfig()
                    );

                console.log(
                    "Update response:",
                    response.data
                );

                const updatedCopy =
                    response.data?.book_copy;

                if (updatedCopy) {
                    setCopies(
                        (previous) =>
                            previous.map(
                                (copy) =>
                                    Number(
                                        copy.copy_id
                                    ) ===
                                    Number(
                                        editingCopy.copy_id
                                    )
                                        ? updatedCopy
                                        : copy
                            )
                    );
                } else {
                    await loadCopies();
                }

                setSuccess(
                    "Book copy updated successfully."
                );
            }

            // =========================
            // ADD
            // =========================

            else {
                const response =
                    await axios.post(
                        BOOK_COPIES_URL,
                        payload,
                        authConfig()
                    );

                console.log(
                    "Create response:",
                    response.data
                );

                const newCopy =
                    response.data?.book_copy;

                if (newCopy) {
                    setCopies(
                        (previous) => [
                            newCopy,
                            ...previous,
                        ]
                    );
                } else {
                    await loadCopies();
                }

                setSuccess(
                    "Book copy added successfully."
                );
            }

            setShowModal(false);
            setEditingCopy(null);

            setForm({
                ...emptyForm,
            });

        } catch (err) {
            console.error(
                "Book copy save error:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to save book copy."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // OPEN DELETE CONFIRMATION
    // =========================

    const openDeleteModal = (copy) => {
        setDeletingCopy(copy);
        setError("");
        setShowDeleteModal(true);
    };

    // =========================
    // CLOSE DELETE MODAL
    // =========================

    const closeDeleteModal = () => {
        if (deleting) return;

        setShowDeleteModal(false);
        setDeletingCopy(null);
    };

    // =========================
    // DELETE BOOK COPY
    // =========================

    const handleDelete = async () => {
        if (!deletingCopy) {
            return;
        }

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            console.log(
                "Deleting book copy:",
                deletingCopy.copy_id
            );

            const response =
                await axios.delete(
                    `${BOOK_COPIES_URL}/${deletingCopy.copy_id}`,
                    authConfig()
                );

            console.log(
                "Delete response:",
                response.data
            );

            setCopies(
                (previous) =>
                    previous.filter(
                        (copy) =>
                            Number(
                                copy.copy_id
                            ) !==
                            Number(
                                deletingCopy.copy_id
                            )
                    )
            );

            setSuccess(
                "Book copy deleted successfully."
            );

            setShowDeleteModal(false);
            setDeletingCopy(null);

        } catch (err) {
            console.error(
                "Book copy delete error:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to delete book copy."
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <section className="book-copies-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="book-copies-header">

                <div>
                    <span className="book-copies-eyebrow">
                        PHYSICAL COLLECTION
                    </span>

                    <h1>
                        Book Copies
                    </h1>

                    <p>
                        Manage physical copies
                        of books, availability
                        and circulation status.
                    </p>
                </div>

                <div className="book-copies-header-actions">

                    <button
                        className="book-copies-refresh-btn"
                        onClick={loadCopies}
                        disabled={loading}
                    >
                        <span>↻</span>
                        Refresh
                    </button>

                    <button
                        className="add-book-copy-btn"
                        onClick={openAddModal}
                    >
                        <span>＋</span>
                        Add Copy
                    </button>

                </div>
            </div>

            {/* =========================
                SUCCESS MESSAGE
            ========================= */}

            {success && (
                <div className="book-copies-success">
                    ✓ {success}
                </div>
            )}

            {/* =========================
                ERROR MESSAGE
            ========================= */}

            {error && !showModal && !showDeleteModal && (
                <div className="book-copies-error">
                    ⚠️ {error}
                </div>
            )}

            {/* =========================
                STATISTICS
            ========================= */}

            <div className="book-copy-stat-grid">

                <article className="book-copy-stat-card">

                    <div className="book-copy-stat-icon total">
                        📦
                    </div>

                    <div>
                        <span>
                            Total Copies
                        </span>

                        <strong>
                            {totalCopies.toLocaleString()}
                        </strong>

                        <small>
                            physical copies
                        </small>
                    </div>

                </article>

                <article className="book-copy-stat-card">

                    <div className="book-copy-stat-icon available">
                        ✅
                    </div>

                    <div>
                        <span>
                            Available
                        </span>

                        <strong>
                            {availableCount.toLocaleString()}
                        </strong>

                        <small>
                            ready to borrow
                        </small>
                    </div>

                </article>

                <article className="book-copy-stat-card">

                    <div className="book-copy-stat-icon borrowed">
                        🔄
                    </div>

                    <div>
                        <span>
                            Borrowed
                        </span>

                        <strong>
                            {borrowedCount.toLocaleString()}
                        </strong>

                        <small>
                            currently issued
                        </small>
                    </div>

                </article>

                <article className="book-copy-stat-card">

                    <div className="book-copy-stat-icon unavailable">
                        ⛔
                    </div>

                    <div>
                        <span>
                            Unavailable
                        </span>

                        <strong>
                            {unavailableCount.toLocaleString()}
                        </strong>

                        <small>
                            not available
                        </small>
                    </div>

                </article>

            </div>

            {/* =========================
                DIRECTORY CARD
            ========================= */}

            <div className="book-copies-card">

                <div className="book-copies-card-header">

                    <div>
                        <h2>
                            Copy Directory
                        </h2>

                        <p>
                            Search and manage
                            individual physical
                            book copies.
                        </p>
                    </div>

                </div>

                {/* =========================
                    TOOLBAR
                ========================= */}

                <div className="book-copies-toolbar">

                    <div className="book-copies-search">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search by copy ID, book ID, accession number or title..."
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
                            All Status
                        </option>

                        <option value="AVAILABLE">
                            Available
                        </option>

                        <option value="BORROWED">
                            Borrowed
                        </option>

                        <option value="UNAVAILABLE">
                            Unavailable
                        </option>

                    </select>

                    <div className="book-copies-result-count">
                        {filteredCopies.length}{" "}
                        {filteredCopies.length === 1
                            ? "copy"
                            : "copies"}
                    </div>

                </div>

                {/* =========================
                    LOADING
                ========================= */}

                {loading ? (

                    <div className="book-copies-loading">

                        <div className="book-copies-spinner"></div>

                        <span>
                            Loading book copies...
                        </span>

                    </div>

                ) : filteredCopies.length === 0 ? (

                    <div className="book-copies-empty">

                        <div className="book-copies-empty-icon">
                            📦
                        </div>

                        <h3>
                            {search
                                ? "No copies found"
                                : "No book copies available"}
                        </h3>

                        <p>
                            {search
                                ? "Try a different search term."
                                : "Add your first physical book copy to get started."}
                        </p>

                    </div>

                ) : (

                    <div className="book-copies-table-wrapper">

                        <table className="book-copies-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Book
                                    </th>

                                    <th>
                                        ISBN
                                    </th>

                                    <th>
                                        Accession Number
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredCopies.map(
                                    (copy) => {

                                        const status =
                                            String(
                                                copy.status ||
                                                    "AVAILABLE"
                                            ).toUpperCase();

                                        const bookTitle =
                                            getBookTitle(
                                                copy
                                            );

                                        return (
                                            <tr
                                                key={
                                                    copy.copy_id
                                                }
                                            >

                                                {/* ID */}

                                                <td>

                                                    <span className="book-copy-id">
                                                        #
                                                        {
                                                            copy.copy_id
                                                        }
                                                    </span>

                                                </td>

                                                {/* BOOK */}

                                                <td>

                                                    <div className="book-copy-profile">

                                                        <div className="book-copy-avatar">

                                                            {(
                                                                bookTitle ||
                                                                "B"
                                                            )
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    bookTitle
                                                                }
                                                            </strong>

                                                            <small>
                                                                Book ID #
                                                                {
                                                                    copy.book_id
                                                                }
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* ISBN */}

                                                <td>

                                                    <span className="book-copy-isbn">
                                                        {getBookISBN(
                                                            copy
                                                        )}
                                                    </span>

                                                </td>

                                                {/* ACCESSION NUMBER */}

                                                <td>

                                                    <span className="book-copy-number">
                                                        {getAccessionNumber(
                                                            copy
                                                        )}
                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`book-copy-status book-copy-status-${status.toLowerCase()}`}
                                                    >

                                                        <span className="book-copy-status-dot"></span>

                                                        {
                                                            status
                                                        }

                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="book-copy-actions">

                                                        <button
                                                            type="button"
                                                            className="book-copy-edit-btn"
                                                            title="Edit book copy"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    copy
                                                                )
                                                            }
                                                        >
                                                            ✏️
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="book-copy-delete-btn"
                                                            title="Delete book copy"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    copy
                                                                )
                                                            }
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

            {/* =========================
                ADD / EDIT MODAL
            ========================= */}

            {showModal && (

                <div
                    className="book-copy-modal-overlay"
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

                    <div className="book-copy-modal">

                        {/* MODAL HEADER */}

                        <div className="book-copy-modal-header">

                            <div className="book-copy-modal-title">

                                <div className="book-copy-modal-icon">
                                    📦
                                </div>

                                <div>

                                    <h2>
                                        {editingCopy
                                            ? "Edit Book Copy"
                                            : "Add Book Copy"}
                                    </h2>

                                    <p>
                                        {editingCopy
                                            ? "Update the physical copy information."
                                            : "Add a physical copy to your collection."}
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                className="book-copy-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="book-copy-form-grid">

                                {/* BOOK */}

                                <div className="book-copy-form-group full">

                                    <label>
                                        Book *
                                    </label>

                                    <select
                                        name="book_id"
                                        value={
                                            form.book_id ||
                                            ""
                                        }
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

                                {/* ACCESSION NUMBER */}

                                <div className="book-copy-form-group">

                                    <label>
                                        Accession Number *
                                    </label>

                                    <input
                                        type="text"
                                        name="accession_number"
                                        value={
                                            form.accession_number ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. ACC-0004"
                                        required
                                    />

                                </div>

                                {/* SHELF LOCATION */}

                                <div className="book-copy-form-group">

                                    <label>
                                        Shelf Location
                                    </label>

                                    <input
                                        type="text"
                                        name="shelf_location"
                                        value={
                                            form.shelf_location ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. A-12"
                                    />

                                </div>

                                {/* STATUS */}

                                <div className="book-copy-form-group">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            form.status ||
                                            "AVAILABLE"
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="AVAILABLE">
                                            Available
                                        </option>

                                        <option value="BORROWED">
                                            Borrowed
                                        </option>

                                        <option value="LOST">
                                            Lost
                                        </option>

                                        <option value="DAMAGED">
                                            Damaged
                                        </option>

                                        <option value="MAINTENANCE">
                                            Maintenance
                                        </option>

                                    </select>

                                </div>

                            </div>

                            {/* FORM ERROR */}

                            {error && (

                                <div className="book-copy-form-error">
                                    ⚠️ {error}
                                </div>

                            )}

                            {/* MODAL ACTIONS */}

                            <div className="book-copy-modal-actions">

                                <button
                                    type="button"
                                    className="book-copy-cancel-btn"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="book-copy-save-btn"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingCopy
                                        ? "Save Changes"
                                        : "Add Copy"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* =========================
                DELETE CONFIRMATION
            ========================= */}

            {showDeleteModal && deletingCopy && (

                <div
                    className="book-copy-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                                event.currentTarget &&
                            !deleting
                        ) {
                            closeDeleteModal();
                        }

                    }}
                >

                    <div className="book-copy-modal">

                        <div className="book-copy-modal-header">

                            <div className="book-copy-modal-title">

                                <div className="book-copy-modal-icon">
                                    🗑️
                                </div>

                                <div>

                                    <h2>
                                        Delete Book Copy
                                    </h2>

                                    <p>
                                        This action cannot
                                        be undone.
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                className="book-copy-modal-close"
                                onClick={
                                    closeDeleteModal
                                }
                                disabled={deleting}
                            >
                                ×
                            </button>

                        </div>

                        <div className="book-copy-delete-content">

                            <p>
                                Are you sure you want
                                to delete this physical
                                book copy?
                            </p>

                            <div className="book-copy-delete-info">

                                <strong>
                                    {getBookTitle(
                                        deletingCopy
                                    )}
                                </strong>

                                <span>
                                    Copy #
                                    {
                                        deletingCopy.copy_id
                                    }
                                    {" • "}
                                    {
                                        deletingCopy.accession_number ||
                                        "No accession number"
                                    }
                                </span>

                            </div>

                        </div>

                        {error && (

                            <div className="book-copy-form-error">
                                ⚠️ {error}
                            </div>

                        )}

                        <div className="book-copy-modal-actions">

                            <button
                                type="button"
                                className="book-copy-cancel-btn"
                                onClick={
                                    closeDeleteModal
                                }
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="book-copy-delete-confirm-btn"
                                onClick={
                                    handleDelete
                                }
                                disabled={deleting}
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete Copy"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </section>
    );
}