import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Categories.css";

const API_URL = "http://127.0.0.1:5000/api";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
    });

    const getToken = () => localStorage.getItem("access_token");

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/categories/`,
                authConfig()
            );

            setCategories(response.data?.categories || response.data || []);
        } catch (err) {
            console.error("Failed to load categories:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to load categories."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return categories;
        }

        return categories.filter((category) => {
            return (
                String(category.category_id || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(category.name || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(category.description || "")
                    .toLowerCase()
                    .includes(keyword)
            );
        });
    }, [categories, search]);

    const openAddModal = () => {
        setEditingCategory(null);

        setForm({
            name: "",
            description: "",
        });

        setError("");
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);

        setForm({
            name: category.name || "",
            description: category.description || "",
        });

        setError("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingCategory(null);

        setForm({
            name: "",
            description: "",
        });
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

        if (!form.name.trim()) {
            setError("Category name is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (editingCategory) {
                const response = await axios.put(
                    `${API_URL}/categories/${editingCategory.category_id}`,
                    {
                        name: form.name.trim(),
                        description: form.description.trim(),
                    },
                    authConfig()
                );

                const updatedCategory = response.data?.category;

                setCategories((previous) =>
                    previous.map((category) =>
                        category.category_id === editingCategory.category_id
                            ? updatedCategory || {
                                  ...category,
                                  name: form.name.trim(),
                                  description: form.description.trim(),
                              }
                            : category
                    )
                );

                setSuccess("Category updated successfully.");
            } else {
                const response = await axios.post(
                    `${API_URL}/categories/`,
                    {
                        name: form.name.trim(),
                        description: form.description.trim(),
                    },
                    authConfig()
                );

                const newCategory = response.data?.category;

                if (newCategory) {
                    setCategories((previous) => [
                        newCategory,
                        ...previous,
                    ]);
                } else {
                    await loadCategories();
                }

                setSuccess("Category created successfully.");
            }

            setShowModal(false);
            setEditingCategory(null);

            setForm({
                name: "",
                description: "",
            });
        } catch (err) {
            console.error("Category save error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to save category."
            );
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setCategoryToDelete(null);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            setError("");
            setSuccess("");

            await axios.delete(
                `${API_URL}/categories/${categoryToDelete.category_id}`,
                authConfig()
            );

            setCategories((previous) =>
                previous.filter(
                    (category) =>
                        category.category_id !==
                        categoryToDelete.category_id
                )
            );

            setSuccess("Category deleted successfully.");
            closeDeleteModal();
        } catch (err) {
            console.error("Category delete error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to delete category."
            );
        }
    };

    const totalCategories = categories.length;
    const visibleCategories = filteredCategories.length;

    return (
        <section className="categories-page">

            {/* HEADER */}

            <div className="categories-header">

                <div>
                    <span className="categories-eyebrow">
                        LIBRARY ORGANIZATION
                    </span>

                    <h1>Categories</h1>

                    <p>
                        Organize and manage your library book categories.
                    </p>
                </div>

                <div className="categories-header-actions">

                    <button
                        className="categories-refresh-btn"
                        onClick={loadCategories}
                        disabled={loading}
                    >
                        <span>↻</span>
                        Refresh
                    </button>

                    <button
                        className="add-category-btn"
                        onClick={openAddModal}
                    >
                        <span>＋</span>
                        Add Category
                    </button>

                </div>
            </div>


            {/* MESSAGES */}

            {success && (
                <div className="categories-success">
                    ✓ {success}
                </div>
            )}

            {error && !showModal && (
                <div className="categories-error">
                    ⚠️ {error}
                </div>
            )}


            {/* STATISTICS */}

            <div className="category-stat-grid">

                <article className="category-stat-card">

                    <div className="category-stat-icon total">
                        🗂️
                    </div>

                    <div>
                        <span>Total Categories</span>

                        <strong>
                            {totalCategories.toLocaleString()}
                        </strong>

                        <small>
                            categories in library
                        </small>
                    </div>

                </article>


                <article className="category-stat-card">

                    <div className="category-stat-icon visible">
                        👁️
                    </div>

                    <div>
                        <span>Visible Results</span>

                        <strong>
                            {visibleCategories.toLocaleString()}
                        </strong>

                        <small>
                            matching your search
                        </small>
                    </div>

                </article>


                <article className="category-stat-card">

                    <div className="category-stat-icon books">
                        📚
                    </div>

                    <div>
                        <span>Organization</span>

                        <strong>
                            {totalCategories > 0 ? "Active" : "—"}
                        </strong>

                        <small>
                            category system status
                        </small>
                    </div>

                </article>

            </div>


            {/* MAIN CARD */}

            <div className="categories-card">

                <div className="categories-card-header">

                    <h2>Category Directory</h2>

                    <p>
                        View, search, edit and manage library categories.
                    </p>

                </div>


                {/* TOOLBAR */}

                <div className="categories-toolbar">

                    <div className="categories-search">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                    </div>

                    <div className="categories-result-count">
                        {visibleCategories}{" "}
                        {visibleCategories === 1
                            ? "category"
                            : "categories"}
                    </div>

                </div>


                {/* TABLE */}

                {loading ? (

                    <div className="categories-loading">

                        <div className="categories-spinner"></div>

                        <span>
                            Loading categories...
                        </span>

                    </div>

                ) : filteredCategories.length === 0 ? (

                    <div className="categories-empty">

                        <div className="categories-empty-icon">
                            🗂️
                        </div>

                        <h3>
                            {search
                                ? "No categories found"
                                : "No categories available"}
                        </h3>

                        <p>
                            {search
                                ? "Try a different search term."
                                : "Add your first category to get started."}
                        </p>

                    </div>

                ) : (

                    <div className="categories-table-wrapper">

                        <table className="categories-table">

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>

                            <tbody>

                                {filteredCategories.map((category) => (

                                    <tr key={category.category_id}>

                                        <td>
                                            <span className="category-id">
                                                #{category.category_id}
                                            </span>
                                        </td>

                                        <td>

                                            <div className="category-profile">

                                                <div className="category-avatar">
                                                    {(
                                                        category.name ||
                                                        "C"
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {category.name}
                                                    </strong>

                                                    <small>
                                                        Library category
                                                    </small>
                                                </div>

                                            </div>

                                        </td>

                                        <td>

                                            {category.description ? (
                                                <div className="category-description">
                                                    {category.description}
                                                </div>
                                            ) : (
                                                <div className="category-description empty">
                                                    No description
                                                </div>
                                            )}

                                        </td>

                                        <td>

                                            <div className="category-actions">

                                                <button
                                                    className="category-edit-btn"
                                                    onClick={() =>
                                                        openEditModal(category)
                                                    }
                                                    title="Edit category"
                                                >
                                                    ✏️
                                                </button>

                                                <button
                                                    className="category-delete-btn"
                                                    onClick={() =>
                                                        openDeleteModal(category)
                                                    }
                                                    title="Delete category"
                                                >
                                                    🗑️
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ADD / EDIT MODAL */}

            {showModal && (

                <div
                    className="category-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !saving
                        ) {
                            closeModal();
                        }
                    }}
                >

                    <div className="category-modal">

                        <div className="category-modal-header">

                            <div className="category-modal-title">

                                <div className="category-modal-icon">
                                    🗂️
                                </div>

                                <div>

                                    <h2>
                                        {editingCategory
                                            ? "Edit Category"
                                            : "Add Category"}
                                    </h2>

                                    <p>
                                        {editingCategory
                                            ? "Update category information."
                                            : "Create a new library category."}
                                    </p>

                                </div>

                            </div>

                            <button
                                className="category-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={handleSubmit}>

                            <div className="category-form-group">

                                <label>
                                    Category Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter category name"
                                    autoFocus
                                    required
                                />

                            </div>


                            <div className="category-form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Enter a short description..."
                                    rows="5"
                                />

                            </div>


                            {error && (
                                <div className="category-form-error">
                                    ⚠️ {error}
                                </div>
                            )}


                            <div className="category-modal-actions">

                                <button
                                    type="button"
                                    className="category-cancel-btn"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="category-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingCategory
                                        ? "Update Category"
                                        : "Create Category"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* DELETE MODAL */}

            {showDeleteModal && categoryToDelete && (

                <div className="category-modal-overlay">

                    <div className="category-delete-modal">

                        <div className="category-delete-icon">
                            🗑️
                        </div>

                        <h2>
                            Delete Category?
                        </h2>

                        <p>
                            Are you sure you want to delete{" "}
                            <strong>
                                {categoryToDelete.name}
                            </strong>
                            ? This action cannot be undone.
                        </p>

                        <div className="category-delete-actions">

                            <button
                                className="category-delete-cancel"
                                onClick={closeDeleteModal}
                            >
                                Cancel
                            </button>

                            <button
                                className="category-delete-confirm"
                                onClick={handleDelete}
                            >
                                Delete Category
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </section>
    );
}