import { useEffect, useState } from "react";
import axios from "axios";
import "./Authors.css";

const API_URL = "http://127.0.0.1:5000/api";

const emptyForm = {
    name: "",
    biography: "",
};

function Authors() {
    const [authors, setAuthors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState(null);

    const [form, setForm] = useState(emptyForm);


    // =====================================================
    // LOAD AUTHORS
    // =====================================================

    const fetchAuthors = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("access_token");

            const response = await axios.get(
                `${API_URL}/authors/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = response.data;

            if (Array.isArray(data)) {
                setAuthors(data);
            } else if (Array.isArray(data.authors)) {
                setAuthors(data.authors);
            } else if (Array.isArray(data.data)) {
                setAuthors(data.data);
            } else {
                setAuthors([]);
            }

        } catch (err) {
            console.error("Authors error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                `Unable to load authors. Server returned ${
                    err.response?.status || "an unknown error"
                }.`
            );
        } finally {
            setLoading(false);
        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchAuthors();
    }, []);


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // =====================================================
    // OPEN ADD MODAL
    // =====================================================

    const openAddModal = () => {
        setError("");
        setSuccess("");

        setEditingAuthor(null);

        setForm(emptyForm);

        setShowModal(true);
    };


    // =====================================================
    // OPEN EDIT MODAL
    // =====================================================

    const openEditModal = (author) => {
        setError("");
        setSuccess("");

        setEditingAuthor(author);

        setForm({
            name: author.name || "",
            biography: author.biography || "",
        });

        setShowModal(true);
    };


    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingAuthor(null);
        setForm(emptyForm);
    };


    // =====================================================
    // SAVE AUTHOR
    // CREATE OR UPDATE
    // =====================================================

    const handleSaveAuthor = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!form.name.trim()) {
            setError("Author name is required.");
            return;
        }

        try {
            setSaving(true);

            const token = localStorage.getItem("access_token");

            const payload = {
                name: form.name.trim(),
                biography: form.biography.trim() || null,
            };


            // UPDATE
            if (editingAuthor) {

                await axios.put(
                    `${API_URL}/authors/${editingAuthor.author_id}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setSuccess(
                    "Author updated successfully."
                );

            }

            // CREATE
            else {

                await axios.post(
                    `${API_URL}/authors/`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setSuccess(
                    "Author created successfully."
                );
            }


            setShowModal(false);
            setEditingAuthor(null);
            setForm(emptyForm);

            await fetchAuthors();

        } catch (err) {
            console.error("Save author error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to save author."
            );
        } finally {
            setSaving(false);
        }
    };


    // =====================================================
    // DELETE AUTHOR
    // =====================================================

    const handleDeleteAuthor = async (
        authorId,
        authorName
    ) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete "${authorName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            const token = localStorage.getItem("access_token");

            await axios.delete(
                `${API_URL}/authors/${authorId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccess(
                "Author deleted successfully."
            );

            await fetchAuthors();

        } catch (err) {
            console.error("Delete author error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to delete author."
            );
        }
    };


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredAuthors = authors.filter((author) => {

        const text = search.toLowerCase();

        return (
            !search ||
            String(author.author_id || "")
                .toLowerCase()
                .includes(text) ||
            String(author.name || "")
                .toLowerCase()
                .includes(text) ||
            String(author.biography || "")
                .toLowerCase()
                .includes(text)
        );
    });


    // =====================================================
    // STATISTICS
    // =====================================================

    const authorsWithBiography = authors.filter(
        (author) =>
            author.biography &&
            String(author.biography).trim()
    ).length;

    const authorsWithoutBiography =
        authors.length - authorsWithBiography;


    // =====================================================
    // INITIALS
    // =====================================================

    const getInitials = (name) => {

        if (!name) {
            return "?";
        }

        return String(name)
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();
    };


    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="authors-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="authors-header">

                <div>

                    <span className="authors-eyebrow">
                        LIBRARY MANAGEMENT
                    </span>

                    <h1>Author Management</h1>

                    <p>
                        Manage authors and their information.
                    </p>

                </div>


                <div className="authors-header-actions">

                    <button
                        className="authors-refresh-btn"
                        onClick={fetchAuthors}
                    >
                        <span>↻</span>
                        Refresh
                    </button>


                    <button
                        className="add-author-btn"
                        onClick={openAddModal}
                    >
                        <span>＋</span>
                        Add Author
                    </button>

                </div>

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {success && (
                <div className="authors-success">
                    ✓ {success}
                </div>
            )}

            {error && (
                <div className="authors-error">
                    ⚠️ {error}
                </div>
            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="author-stat-grid">

                <div className="author-stat-card">

                    <div className="author-stat-icon total">
                        ✍️
                    </div>

                    <div>
                        <span>Total Authors</span>
                        <strong>{authors.length}</strong>
                        <small>Registered authors</small>
                    </div>

                </div>


                <div className="author-stat-card">

                    <div className="author-stat-icon complete">
                        ✓
                    </div>

                    <div>
                        <span>With Biography</span>
                        <strong>
                            {authorsWithBiography}
                        </strong>
                        <small>Detailed profiles</small>
                    </div>

                </div>


                <div className="author-stat-card">

                    <div className="author-stat-icon missing">
                        ○
                    </div>

                    <div>
                        <span>Basic Profiles</span>
                        <strong>
                            {authorsWithoutBiography}
                        </strong>
                        <small>Without biography</small>
                    </div>

                </div>


                <div className="author-stat-card">

                    <div className="author-stat-icon visible">
                        🔎
                    </div>

                    <div>
                        <span>Displayed</span>
                        <strong>
                            {filteredAuthors.length}
                        </strong>
                        <small>Matching authors</small>
                    </div>

                </div>

            </div>


            {/* =================================================
                MAIN CARD
            ================================================= */}

            <div className="authors-card">

                <div className="authors-card-header">

                    <div>

                        <h2>Authors</h2>

                        <p>
                            Search and manage your library's authors.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="authors-toolbar">

                    <div className="authors-search">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search by author name or biography..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                </div>


                {/* =================================================
                    CONTENT
                ================================================= */}

                {loading ? (

                    <div className="authors-loading">

                        <div className="authors-spinner"></div>

                        <p>
                            Loading authors...
                        </p>

                    </div>

                ) : filteredAuthors.length === 0 ? (

                    <div className="authors-empty">

                        <div className="authors-empty-icon">
                            ✍️
                        </div>

                        <h3>
                            No authors found
                        </h3>

                        <p>
                            Add your first author to the library.
                        </p>

                        <button
                            className="empty-add-author-btn"
                            onClick={openAddModal}
                        >
                            ＋ Add Author
                        </button>

                    </div>

                ) : (

                    <div className="authors-table-wrapper">

                        <table className="authors-table">

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>Author</th>
                                    <th>Biography</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>


                            <tbody>

                                {filteredAuthors.map(
                                    (author) => (

                                        <tr
                                            key={
                                                author.author_id
                                            }
                                        >

                                            {/* ID */}

                                            <td>

                                                <span className="author-id">
                                                    #
                                                    {
                                                        author.author_id
                                                    }
                                                </span>

                                            </td>


                                            {/* AUTHOR */}

                                            <td>

                                                <div className="author-profile">

                                                    <div className="author-avatar">
                                                        {getInitials(
                                                            author.name
                                                        )}
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                author.name
                                                            }
                                                        </strong>

                                                        <small>
                                                            Library author
                                                        </small>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* BIOGRAPHY */}

                                            <td>

                                                {author.biography ? (

                                                    <div className="author-biography">

                                                        {
                                                            author.biography
                                                        }

                                                    </div>

                                                ) : (

                                                    <span className="no-biography">
                                                        No biography available
                                                    </span>

                                                )}

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="author-actions">

                                                    <button
                                                        className="edit-author-btn"
                                                        onClick={() =>
                                                            openEditModal(
                                                                author
                                                            )
                                                        }
                                                        title="Edit author"
                                                    >
                                                        ✏️
                                                    </button>


                                                    <button
                                                        className="delete-author-btn"
                                                        onClick={() =>
                                                            handleDeleteAuthor(
                                                                author.author_id,
                                                                author.name
                                                            )
                                                        }
                                                        title="Delete author"
                                                    >
                                                        🗑️
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="author-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="author-modal">


                        {/* MODAL HEADER */}

                        <div className="author-modal-header">

                            <div className="author-modal-title">

                                <div className="author-modal-icon">
                                    {editingAuthor
                                        ? "✏️"
                                        : "✍️"}
                                </div>

                                <div>

                                    <h2>
                                        {editingAuthor
                                            ? "Edit Author"
                                            : "Add New Author"}
                                    </h2>

                                    <p>
                                        {editingAuthor
                                            ? "Update the author's information."
                                            : "Add an author to your library."}
                                    </p>

                                </div>

                            </div>


                            <button
                                className="author-modal-close"
                                onClick={closeModal}
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSaveAuthor
                            }
                        >

                            <div className="author-form-group">

                                <label>
                                    Author Name *
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="e.g. William Shakespeare"
                                    required
                                />

                            </div>


                            <div className="author-form-group">

                                <label>
                                    Biography
                                </label>

                                <textarea
                                    name="biography"
                                    value={
                                        form.biography
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="Write a short biography..."
                                    rows="6"
                                />

                            </div>


                            {/* ACTIONS */}

                            <div className="author-modal-actions">

                                <button
                                    type="button"
                                    className="author-cancel-btn"
                                    onClick={
                                        closeModal
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="author-save-btn"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingAuthor
                                        ? "Save Changes"
                                        : "Create Author"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Authors;