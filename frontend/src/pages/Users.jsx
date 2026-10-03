import { useEffect, useState } from "react";
import axios from "axios";
import "./Users.css";

const API_URL = "http://127.0.0.1:5000/api";

const emptyForm = {
    name: "",
    username: "",
    password: "",
    role: "LIBRARIAN",
    status: "ACTIVE",
};

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("access_token");

            const response = await axios.get(
                `${API_URL}/users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = response.data;

            if (Array.isArray(data)) {
                setUsers(data);
            } else if (Array.isArray(data.users)) {
                setUsers(data.users);
            } else if (Array.isArray(data.data)) {
                setUsers(data.data);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error("Users error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                `Unable to load users. Server returned ${err.response?.status || "an unknown error"}.`
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleAddUser = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!form.name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!form.username.trim()) {
            setError("Username is required.");
            return;
        }

        if (!form.password) {
            setError("Password is required.");
            return;
        }

        try {
            setSaving(true);

            const token = localStorage.getItem("access_token");

            await axios.post(
                `${API_URL}/users`,
                {
                    name: form.name.trim(),
                    username: form.username.trim(),
                    password: form.password,
                    role: form.role,
                    status: form.status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccess("User created successfully.");

            setForm(emptyForm);
            setShowAddForm(false);

            await fetchUsers();
        } catch (err) {
            console.error("Create user error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to create user."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${userName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            const token = localStorage.getItem("access_token");

            await axios.delete(
                `${API_URL}/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccess("User deleted successfully.");

            await fetchUsers();
        } catch (err) {
            console.error("Delete user error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to delete user."
            );
        }
    };

    const filteredUsers = users.filter((user) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            !search ||
            String(user.user_id || "")
                .toLowerCase()
                .includes(searchText) ||
            String(user.name || "")
                .toLowerCase()
                .includes(searchText) ||
            String(user.username || "")
                .toLowerCase()
                .includes(searchText);

        const matchesRole =
            roleFilter === "ALL" ||
            String(user.role || "").toUpperCase() === roleFilter;

        const matchesStatus =
            statusFilter === "ALL" ||
            String(user.status || "").toUpperCase() === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const totalUsers = users.length;

    const activeUsers = users.filter(
        (user) =>
            String(user.status || "").toUpperCase() === "ACTIVE"
    ).length;

    const admins = users.filter(
        (user) =>
            String(user.role || "").toUpperCase() === "ADMIN"
    ).length;

    const librarians = users.filter(
        (user) =>
            String(user.role || "").toUpperCase() === "LIBRARIAN"
    ).length;

    const getInitials = (name) => {
        if (!name) return "?";

        return String(name)
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();
    };

    const getRoleClass = (role) => {
        const value = String(role || "").toLowerCase();

        if (value === "admin") return "role-admin";
        if (value === "librarian") return "role-librarian";

        return "role-default";
    };

    const getStatusClass = (status) => {
        return String(status || "").toUpperCase() === "ACTIVE"
            ? "status-active"
            : "status-inactive";
    };

    return (
        <div className="users-page">

            {/* HEADER */}
            <div className="users-header">

                <div>
                    <span className="page-eyebrow">
                        LIBRARY MANAGEMENT
                    </span>

                    <h1>User Management</h1>

                    <p>
                        Manage library staff accounts, roles and account status.
                    </p>
                </div>

                <div className="users-header-actions">

                    <button
                        className="refresh-btn"
                        onClick={fetchUsers}
                    >
                        <span>↻</span>
                        Refresh
                    </button>

                    <button
                        className="add-user-btn"
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            setForm(emptyForm);
                            setShowAddForm(true);
                        }}
                    >
                        <span>＋</span>
                        Add User
                    </button>

                </div>

            </div>


            {/* ALERTS */}
            {success && (
                <div className="users-success">
                    ✓ {success}
                </div>
            )}

            {error && (
                <div className="users-error">
                    ⚠️ {error}
                </div>
            )}


            {/* STATISTICS */}
            <div className="user-stat-grid">

                <div className="user-stat-card">
                    <div className="user-stat-icon users-icon">
                        👥
                    </div>

                    <div>
                        <span>Total Users</span>
                        <strong>{totalUsers}</strong>
                        <small>Registered accounts</small>
                    </div>
                </div>


                <div className="user-stat-card">
                    <div className="user-stat-icon active-icon">
                        ✓
                    </div>

                    <div>
                        <span>Active Users</span>
                        <strong>{activeUsers}</strong>
                        <small>Currently active</small>
                    </div>
                </div>


                <div className="user-stat-card">
                    <div className="user-stat-icon admin-icon">
                        🛡️
                    </div>

                    <div>
                        <span>Administrators</span>
                        <strong>{admins}</strong>
                        <small>Admin accounts</small>
                    </div>
                </div>


                <div className="user-stat-card">
                    <div className="user-stat-icon librarian-icon">
                        📚
                    </div>

                    <div>
                        <span>Librarians</span>
                        <strong>{librarians}</strong>
                        <small>Librarian accounts</small>
                    </div>
                </div>

            </div>


            {/* USERS CARD */}
            <div className="users-card">

                <div className="users-card-header">

                    <div>
                        <h2>Library Users</h2>

                        <p>
                            {filteredUsers.length} user
                            {filteredUsers.length !== 1 ? "s" : ""} found
                        </p>
                    </div>

                </div>


                {/* FILTERS */}
                <div className="users-toolbar">

                    <div className="search-box">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                    </div>


                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="ALL">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="LIBRARIAN">Librarian</option>
                    </select>


                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                </div>


                {/* TABLE */}
                {loading ? (

                    <div className="users-loading">
                        <div className="users-spinner"></div>
                        <p>Loading users...</p>
                    </div>

                ) : filteredUsers.length === 0 ? (

                    <div className="users-empty">
                        <div className="empty-icon">👤</div>

                        <h3>No users found</h3>

                        <p>
                            Try changing your search or filter.
                        </p>
                    </div>

                ) : (

                    <div className="users-table-wrapper">

                        <table className="users-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredUsers.map((user) => (

                                    <tr key={user.user_id}>

                                        <td>
                                            <span className="user-id">
                                                #{user.user_id}
                                            </span>
                                        </td>


                                        <td>
                                            <div className="user-profile">

                                                <div className="avatar">
                                                    {getInitials(user.name)}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {user.name || "Unknown User"}
                                                    </strong>

                                                    <small>
                                                        Library account
                                                    </small>
                                                </div>

                                            </div>
                                        </td>


                                        <td>
                                            <span className="username">
                                                @{user.username}
                                            </span>
                                        </td>


                                        <td>
                                            <span
                                                className={`role-badge ${getRoleClass(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>


                                        <td>
                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    user.status
                                                )}`}
                                            >
                                                <span className="status-dot"></span>
                                                {user.status}
                                            </span>
                                        </td>


                                        <td>
                                            <button
                                                className="delete-user-btn"
                                                onClick={() =>
                                                    handleDeleteUser(
                                                        user.user_id,
                                                        user.name
                                                    )
                                                }
                                                title="Delete user"
                                            >
                                                🗑️
                                            </button>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ADD USER MODAL */}
            {showAddForm && (

                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowAddForm(false);
                        }
                    }}
                >

                    <div className="user-modal">

                        <div className="user-modal-header">

                            <div>
                                <span className="modal-icon">
                                    👤
                                </span>

                                <div>
                                    <h2>Add New User</h2>
                                    <p>
                                        Create a new library staff account.
                                    </p>
                                </div>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setShowAddForm(false)}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={handleAddUser}>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label>
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleFormChange}
                                        placeholder="e.g. Ahmad Khan"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Username
                                    </label>

                                    <input
                                        type="text"
                                        name="username"
                                        value={form.username}
                                        onChange={handleFormChange}
                                        placeholder="e.g. ahmad"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleFormChange}
                                        placeholder="Enter password"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Role
                                    </label>

                                    <select
                                        name="role"
                                        value={form.role}
                                        onChange={handleFormChange}
                                    >
                                        <option value="LIBRARIAN">
                                            Librarian
                                        </option>

                                        <option value="ADMIN">
                                            Administrator
                                        </option>
                                    </select>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleFormChange}
                                    >
                                        <option value="ACTIVE">
                                            Active
                                        </option>

                                        <option value="INACTIVE">
                                            Inactive
                                        </option>
                                    </select>

                                </div>

                            </div>


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-user-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create User"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Users;