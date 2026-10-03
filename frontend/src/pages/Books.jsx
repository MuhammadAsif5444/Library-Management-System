import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Books.css";

const API_URL = "http://127.0.0.1:5000/api";

export default function Books() {
    const [books, setBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [editingBook, setEditingBook] = useState(null);
    const [bookToDelete, setBookToDelete] = useState(null);

    const emptyForm = {
        isbn: "",
        title: "",
        author_id: "",
        category_id: "",
        publisher: "",
        publication_year: "",
        total_copies: "",
        shelf_location: "",
        status: "AVAILABLE",
    };

    const [form, setForm] = useState(emptyForm);

    const getToken = () => localStorage.getItem("access_token");

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const loadBooks = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/books/`,
                authConfig()
            );

            setBooks(
                response.data?.books ||
                response.data?.data ||
                response.data ||
                []
            );
        } catch (err) {
            console.error("Failed to load books:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to load books."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadAuthorsAndCategories = async () => {
        try {
            const [authorsResponse, categoriesResponse] =
                await Promise.all([
                    axios.get(`${API_URL}/authors/`, authConfig()),
                    axios.get(`${API_URL}/categories/`, authConfig()),
                ]);

            setAuthors(
                authorsResponse.data?.authors ||
                authorsResponse.data?.data ||
                authorsResponse.data ||
                []
            );

            setCategories(
                categoriesResponse.data?.categories ||
                categoriesResponse.data?.data ||
                categoriesResponse.data ||
                []
            );
        } catch (err) {
            console.error(
                "Failed to load authors/categories:",
                err
            );
        }
    };

    useEffect(() => {
        loadBooks();
        loadAuthorsAndCategories();
    }, []);

    const filteredBooks = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return books.filter((book) => {
            const matchesSearch =
                !keyword ||
                String(book.book_id || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(book.isbn || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(book.title || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(book.author?.name || book.author_name || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(
                    book.category?.name || book.category_name || ""
                )
                    .toLowerCase()
                    .includes(keyword);

            const matchesStatus =
                statusFilter === "ALL" ||
                String(book.status || "").toUpperCase() ===
                    statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [books, search, statusFilter]);

    const availableCount = books.filter(
        (book) =>
            String(book.status || "").toUpperCase() ===
            "AVAILABLE"
    ).length;

    const unavailableCount = books.filter(
        (book) =>
            String(book.status || "").toUpperCase() ===
            "UNAVAILABLE"
    ).length;

    const totalCopies = books.reduce(
        (sum, book) => sum + Number(book.total_copies || 0),
        0
    );

    const openAddModal = () => {
        setEditingBook(null);
        setForm(emptyForm);
        setError("");
        setShowModal(true);
    };

    const openEditModal = (book) => {
        setEditingBook(book);

        setForm({
            isbn: book.isbn || "",
            title: book.title || "",
            author_id:
                book.author_id ||
                book.author?.author_id ||
                "",
            category_id:
                book.category_id ||
                book.category?.category_id ||
                "",
            publisher: book.publisher || "",
            publication_year:
                book.publication_year || "",
            total_copies:
                book.total_copies ?? "",
            shelf_location:
                book.shelf_location || "",
            status: book.status || "AVAILABLE",
        });

        setError("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingBook(null);
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

        if (!form.isbn.trim()) {
            setError("ISBN is required.");
            return;
        }

        if (!form.title.trim()) {
            setError("Book title is required.");
            return;
        }

        if (!form.author_id) {
            setError("Please select an author.");
            return;
        }

        if (!form.category_id) {
            setError("Please select a category.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                isbn: form.isbn.trim(),
                title: form.title.trim(),
                author_id: Number(form.author_id),
                category_id: Number(form.category_id),
                publisher: form.publisher.trim() || null,
                publication_year:
                    form.publication_year
                        ? Number(form.publication_year)
                        : null,
                total_copies:
                    form.total_copies === ""
                        ? 0
                        : Number(form.total_copies),
                shelf_location:
                    form.shelf_location.trim() || null,
                status: form.status,
            };

            if (editingBook) {
                const response = await axios.put(
                    `${API_URL}/books/${editingBook.book_id}`,
                    payload,
                    authConfig()
                );

                const updatedBook = response.data?.book;

                if (updatedBook) {
                    setBooks((previous) =>
                        previous.map((book) =>
                            book.book_id === editingBook.book_id
                                ? updatedBook
                                : book
                        )
                    );
                } else {
                    await loadBooks();
                }

                setSuccess("Book updated successfully.");
            } else {
                const response = await axios.post(
                    `${API_URL}/books/`,
                    payload,
                    authConfig()
                );

                const newBook = response.data?.book;

                if (newBook) {
                    setBooks((previous) => [
                        newBook,
                        ...previous,
                    ]);
                } else {
                    await loadBooks();
                }

                setSuccess("Book added successfully.");
            }

            setShowModal(false);
            setEditingBook(null);
            setForm(emptyForm);
        } catch (err) {
            console.error("Book save error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to save book."
            );
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (book) => {
        setBookToDelete(book);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setBookToDelete(null);
    };

    const handleDelete = async () => {
        if (!bookToDelete) return;

        try {
            setError("");
            setSuccess("");

            await axios.delete(
                `${API_URL}/books/${bookToDelete.book_id}`,
                authConfig()
            );

            setBooks((previous) =>
                previous.filter(
                    (book) =>
                        book.book_id !== bookToDelete.book_id
                )
            );

            setSuccess("Book deleted successfully.");
            closeDeleteModal();
        } catch (err) {
            console.error("Book delete error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to delete book."
            );
        }
    };

    const getAuthorName = (book) => {
        return (
            book.author?.name ||
            book.author_name ||
            authors.find(
                (author) =>
                    Number(author.author_id) ===
                    Number(book.author_id)
            )?.name ||
            "Unknown Author"
        );
    };

    const getCategoryName = (book) => {
        return (
            book.category?.name ||
            book.category_name ||
            categories.find(
                (category) =>
                    Number(category.category_id) ===
                    Number(book.category_id)
            )?.name ||
            "Uncategorized"
        );
    };

    return (
        <section className="books-page">

            {/* HEADER */}

            <div className="books-header">

                <div>
                    <span className="books-eyebrow">
                        LIBRARY COLLECTION
                    </span>

                    <h1>Books</h1>

                    <p>
                        Manage your library collection,
                        authors, copies and book information.
                    </p>
                </div>

                <div className="books-header-actions">

                    <button
                        className="books-refresh-btn"
                        onClick={loadBooks}
                        disabled={loading}
                    >
                        <span>↻</span>
                        Refresh
                    </button>

                    <button
                        className="add-book-btn"
                        onClick={openAddModal}
                    >
                        <span>＋</span>
                        Add Book
                    </button>

                </div>

            </div>


            {/* MESSAGES */}

            {success && (
                <div className="books-success">
                    ✓ {success}
                </div>
            )}

            {error && !showModal && (
                <div className="books-error">
                    ⚠️ {error}
                </div>
            )}


            {/* STATISTICS */}

            <div className="book-stat-grid">

                <article className="book-stat-card">

                    <div className="book-stat-icon total">
                        📚
                    </div>

                    <div>
                        <span>Total Books</span>

                        <strong>
                            {books.length.toLocaleString()}
                        </strong>

                        <small>
                            titles in catalog
                        </small>
                    </div>

                </article>


                <article className="book-stat-card">

                    <div className="book-stat-icon available">
                        ✅
                    </div>

                    <div>
                        <span>Available</span>

                        <strong>
                            {availableCount.toLocaleString()}
                        </strong>

                        <small>
                            active book titles
                        </small>
                    </div>

                </article>


                <article className="book-stat-card">

                    <div className="book-stat-icon copies">
                        📦
                    </div>

                    <div>
                        <span>Total Copies</span>

                        <strong>
                            {totalCopies.toLocaleString()}
                        </strong>

                        <small>
                            physical copies
                        </small>
                    </div>

                </article>


                <article className="book-stat-card">

                    <div className="book-stat-icon inactive">
                        ⛔
                    </div>

                    <div>
                        <span>Unavailable</span>

                        <strong>
                            {unavailableCount.toLocaleString()}
                        </strong>

                        <small>
                            inactive titles
                        </small>
                    </div>

                </article>

            </div>


            {/* MAIN CARD */}

            <div className="books-card">

                <div className="books-card-header">

                    <h2>Book Directory</h2>

                    <p>
                        Search, edit and manage your library books.
                    </p>

                </div>


                {/* TOOLBAR */}

                <div className="books-toolbar">

                    <div className="books-search">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search by title, ISBN, author or category..."
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

                        <option value="AVAILABLE">
                            Available
                        </option>

                        <option value="UNAVAILABLE">
                            Unavailable
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>
                    </select>

                    <div className="books-result-count">
                        {filteredBooks.length}{" "}
                        {filteredBooks.length === 1
                            ? "book"
                            : "books"}
                    </div>

                </div>


                {/* TABLE */}

                {loading ? (

                    <div className="books-loading">

                        <div className="books-spinner"></div>

                        <span>
                            Loading books...
                        </span>

                    </div>

                ) : filteredBooks.length === 0 ? (

                    <div className="books-empty">

                        <div className="books-empty-icon">
                            📚
                        </div>

                        <h3>
                            {search
                                ? "No books found"
                                : "No books available"}
                        </h3>

                        <p>
                            {search
                                ? "Try a different search term."
                                : "Add your first book to get started."}
                        </p>

                    </div>

                ) : (

                    <div className="books-table-wrapper">

                        <table className="books-table">

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>Book</th>
                                    <th>ISBN</th>
                                    <th>Author</th>
                                    <th>Category</th>
                                    <th>Copies</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>

                            <tbody>

                                {filteredBooks.map((book) => {

                                    const status =
                                        String(
                                            book.status ||
                                            "AVAILABLE"
                                        ).toUpperCase();

                                    return (
                                        <tr
                                            key={book.book_id}
                                        >

                                            <td>
                                                <span className="book-id">
                                                    #{book.book_id}
                                                </span>
                                            </td>

                                            <td>

                                                <div className="book-profile">

                                                    <div className="book-avatar">
                                                        {(
                                                            book.title ||
                                                            "B"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {book.title}
                                                        </strong>

                                                        <small>
                                                            {book.publisher ||
                                                                "Library collection"}
                                                        </small>
                                                    </div>

                                                </div>

                                            </td>

                                            <td>
                                                <span className="book-isbn">
                                                    {book.isbn}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="book-author">
                                                    {getAuthorName(book)}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="book-category">
                                                    {getCategoryName(book)}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="book-copies">
                                                    {book.total_copies ?? 0}
                                                </span>
                                            </td>

                                            <td>

                                                <span
                                                    className={`book-status book-status-${status.toLowerCase()}`}
                                                >
                                                    <span className="book-status-dot"></span>
                                                    {status}
                                                </span>

                                            </td>

                                            <td>

                                                <div className="book-actions">

                                                    <button
                                                        className="book-edit-btn"
                                                        onClick={() =>
                                                            openEditModal(
                                                                book
                                                            )
                                                        }
                                                        title="Edit book"
                                                    >
                                                        ✏️
                                                    </button>

                                                    <button
                                                        className="book-delete-btn"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                book
                                                            )
                                                        }
                                                        title="Delete book"
                                                    >
                                                        🗑️
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ADD / EDIT MODAL */}

            {showModal && (

                <div
                    className="book-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !saving
                        ) {
                            closeModal();
                        }
                    }}
                >

                    <div className="book-modal">

                        <div className="book-modal-header">

                            <div className="book-modal-title">

                                <div className="book-modal-icon">
                                    📚
                                </div>

                                <div>

                                    <h2>
                                        {editingBook
                                            ? "Edit Book"
                                            : "Add Book"}
                                    </h2>

                                    <p>
                                        {editingBook
                                            ? "Update book information."
                                            : "Add a new book to your library."}
                                    </p>

                                </div>

                            </div>

                            <button
                                className="book-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={handleSubmit}>

                            <div className="book-form-grid">

                                <div className="book-form-group">

                                    <label>
                                        ISBN *
                                    </label>

                                    <input
                                        type="text"
                                        name="isbn"
                                        value={form.isbn}
                                        onChange={handleChange}
                                        placeholder="Enter ISBN"
                                        required
                                    />

                                </div>


                                <div className="book-form-group">

                                    <label>
                                        Book Title *
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Enter book title"
                                        required
                                    />

                                </div>


                                <div className="book-form-group">

                                    <label>
                                        Author *
                                    </label>

                                    <select
                                        name="author_id"
                                        value={form.author_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select author
                                        </option>

                                        {authors.map((author) => (
                                            <option
                                                key={author.author_id}
                                                value={author.author_id}
                                            >
                                                {author.name}
                                            </option>
                                        ))}
                                    </select>

                                </div>


                                <div className="book-form-group">

                                    <label>
                                        Category *
                                    </label>

                                    <select
                                        name="category_id"
                                        value={form.category_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select category
                                        </option>

                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={
                                                        category.category_id
                                                    }
                                                    value={
                                                        category.category_id
                                                    }
                                                >
                                                    {category.name}
                                                </option>
                                            )
                                        )}
                                    </select>

                                </div>


                                <div className="book-form-group">

                                    <label>
                                        Publisher
                                    </label>

                                    <input
                                        type="text"
                                        name="publisher"
                                        value={form.publisher}
                                        onChange={handleChange}
                                        placeholder="Enter publisher"
                                    />

                                </div>


                                <div className="book-form-group">

                                    <label>
                                        Publication Year
                                    </label>

                                    <input
                                        type="number"
                                        name="publication_year"
                                        value={
                                            form.publication_year
                                        }
                                        onChange={handleChange}
                                        placeholder="e.g. 2025"
                                        min="1000"
                                        max="2100"
                                    />

                                </div>


                                <div className="book-form-group">

                                    <label>
                                        Total Copies
                                    </label>

                                    <input
                                        type="number"
                                        name="total_copies"
                                        value={form.total_copies}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                    />

                                </div>


                                <div className="book-form-group">

                                    <label>
                                        Shelf Location
                                    </label>

                                    <input
                                        type="text"
                                        name="shelf_location"
                                        value={
                                            form.shelf_location
                                        }
                                        onChange={handleChange}
                                        placeholder="e.g. A-12"
                                    />

                                </div>


                                <div className="book-form-group">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                    >
                                        <option value="AVAILABLE">
                                            Available
                                        </option>

                                        <option value="UNAVAILABLE">
                                            Unavailable
                                        </option>

                                        <option value="INACTIVE">
                                            Inactive
                                        </option>
                                    </select>

                                </div>

                            </div>


                            {error && (
                                <div className="book-form-error">
                                    ⚠️ {error}
                                </div>
                            )}


                            <div className="book-modal-actions">

                                <button
                                    type="button"
                                    className="book-cancel-btn"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="book-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingBook
                                        ? "Update Book"
                                        : "Add Book"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* DELETE MODAL */}

            {showDeleteModal && bookToDelete && (

                <div className="book-modal-overlay">

                    <div className="book-delete-modal">

                        <div className="book-delete-icon">
                            🗑️
                        </div>

                        <h2>
                            Delete Book?
                        </h2>

                        <p>
                            Are you sure you want to delete{" "}
                            <strong>
                                {bookToDelete.title}
                            </strong>
                            ? This action cannot be undone.
                        </p>

                        <div className="book-delete-actions">

                            <button
                                className="book-delete-cancel"
                                onClick={closeDeleteModal}
                            >
                                Cancel
                            </button>

                            <button
                                className="book-delete-confirm"
                                onClick={handleDelete}
                            >
                                Delete Book
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </section>
    );
}