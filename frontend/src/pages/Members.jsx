import { useEffect, useState } from "react";
import axios from "axios";
import "./Members.css";

const API_URL = "http://127.0.0.1:5000/api";

const emptyForm = {
    student_id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    status: "ACTIVE",
};

function Members() {
    const [members, setMembers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showAddForm, setShowAddForm] = useState(false);

    const [form, setForm] = useState(emptyForm);


    // =====================================================
    // LOAD MEMBERS
    // =====================================================

    const fetchMembers = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("access_token");

            const response = await axios.get(
                `${API_URL}/members`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        search: search || undefined,
                        status:
                            statusFilter !== "ALL"
                                ? statusFilter
                                : undefined,
                        page: 1,
                        per_page: 100,
                    },
                }
            );

            const data = response.data;

            if (Array.isArray(data)) {
                setMembers(data);
            } else if (Array.isArray(data.members)) {
                setMembers(data.members);
            } else if (Array.isArray(data.data)) {
                setMembers(data.data);
            } else {
                setMembers([]);
            }

        } catch (err) {
            console.error("Members error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                `Unable to load members. Server returned ${
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
        fetchMembers();
    }, [search, statusFilter]);


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
    // ADD MEMBER
    // =====================================================

    const handleAddMember = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!form.student_id.trim()) {
            setError("Student ID is required.");
            return;
        }

        if (!form.name.trim()) {
            setError("Member name is required.");
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
                `${API_URL}/members`,
                {
                    student_id: form.student_id.trim(),
                    name: form.name.trim(),
                    email: form.email.trim() || null,
                    phone: form.phone.trim() || null,
                    address: form.address.trim() || null,
                    password: form.password,
                    status: form.status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccess("Member created successfully.");

            setForm(emptyForm);
            setShowAddForm(false);

            await fetchMembers();

        } catch (err) {
            console.error("Create member error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to create member."
            );
        } finally {
            setSaving(false);
        }
    };


    // =====================================================
    // DELETE MEMBER
    // =====================================================

    const handleDeleteMember = async (memberId, memberName) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete "${memberName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            const token = localStorage.getItem("access_token");

            await axios.delete(
                `${API_URL}/members/${memberId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccess("Member deleted successfully.");

            await fetchMembers();

        } catch (err) {
            console.error("Delete member error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to delete member."
            );
        }
    };


    // =====================================================
    // STATUS
    // =====================================================

    const handleStatusChange = async (memberId, currentStatus) => {

        const newStatus =
            String(currentStatus).toUpperCase() === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        try {
            setError("");
            setSuccess("");

            const token = localStorage.getItem("access_token");

            await axios.patch(
                `${API_URL}/members/${memberId}/status`,
                {
                    status: newStatus,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccess(
                `Member status changed to ${newStatus}.`
            );

            await fetchMembers();

        } catch (err) {
            console.error("Status update error:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to update member status."
            );
        }
    };


    // =====================================================
    // HELPERS
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


    const getStatusClass = (status) => {

        return String(status).toUpperCase() === "ACTIVE"
            ? "member-status-active"
            : "member-status-inactive";
    };


    // =====================================================
    // STATISTICS
    // =====================================================

    const activeMembers = members.filter(
        (member) =>
            String(member.status || "").toUpperCase() === "ACTIVE"
    ).length;

    const inactiveMembers = members.filter(
        (member) =>
            String(member.status || "").toUpperCase() === "INACTIVE"
    ).length;


    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="members-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="members-header">

                <div>

                    <span className="members-eyebrow">
                        LIBRARY MANAGEMENT
                    </span>

                    <h1>Member Management</h1>

                    <p>
                        Manage registered members and their library accounts.
                    </p>

                </div>


                <div className="members-header-actions">

                    <button
                        className="members-refresh-btn"
                        onClick={fetchMembers}
                    >
                        <span>↻</span>
                        Refresh
                    </button>


                    <button
                        className="add-member-btn"
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            setForm(emptyForm);
                            setShowAddForm(true);
                        }}
                    >
                        <span>＋</span>
                        Add Member
                    </button>

                </div>

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {success && (
                <div className="members-success">
                    ✓ {success}
                </div>
            )}

            {error && (
                <div className="members-error">
                    ⚠️ {error}
                </div>
            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="member-stat-grid">

                <div className="member-stat-card">

                    <div className="member-stat-icon total">
                        👥
                    </div>

                    <div>
                        <span>Total Members</span>
                        <strong>{members.length}</strong>
                        <small>Registered members</small>
                    </div>

                </div>


                <div className="member-stat-card">

                    <div className="member-stat-icon active">
                        ✓
                    </div>

                    <div>
                        <span>Active Members</span>
                        <strong>{activeMembers}</strong>
                        <small>Currently active</small>
                    </div>

                </div>


                <div className="member-stat-card">

                    <div className="member-stat-icon inactive">
                        ⏸
                    </div>

                    <div>
                        <span>Inactive Members</span>
                        <strong>{inactiveMembers}</strong>
                        <small>Inactive accounts</small>
                    </div>

                </div>


                <div className="member-stat-card">

                    <div className="member-stat-icon visible">
                        🔎
                    </div>

                    <div>
                        <span>Displayed</span>
                        <strong>{members.length}</strong>
                        <small>Matching records</small>
                    </div>

                </div>

            </div>


            {/* =================================================
                MAIN CARD
            ================================================= */}

            <div className="members-card">

                <div className="members-card-header">

                    <div>

                        <h2>Registered Members</h2>

                        <p>
                            Search, manage and monitor library members.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <div className="members-toolbar">

                    <div className="members-search">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search name, student ID, email..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>


                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                    >
                        <option value="ALL">
                            All Status
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>

                    </select>

                </div>


                {/* =================================================
                    CONTENT
                ================================================= */}

                {loading ? (

                    <div className="members-loading">

                        <div className="members-spinner"></div>

                        <p>
                            Loading members...
                        </p>

                    </div>

                ) : members.length === 0 ? (

                    <div className="members-empty">

                        <div className="members-empty-icon">
                            👥
                        </div>

                        <h3>
                            No members found
                        </h3>

                        <p>
                            Try changing your search or add a new member.
                        </p>

                    </div>

                ) : (

                    <div className="members-table-wrapper">

                        <table className="members-table">

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>Member</th>
                                    <th>Student ID</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>


                            <tbody>

                                {members.map((member) => {

                                    const memberId =
                                        member.member_id;

                                    const name =
                                        member.name ||
                                        "Unknown Member";

                                    const studentId =
                                        member.student_id ||
                                        "—";

                                    const email =
                                        member.email ||
                                        "—";

                                    const phone =
                                        member.phone ||
                                        "—";

                                    const status =
                                        member.status ||
                                        "UNKNOWN";

                                    return (

                                        <tr key={memberId}>

                                            {/* ID */}

                                            <td>

                                                <span className="member-id">
                                                    #{memberId}
                                                </span>

                                            </td>


                                            {/* MEMBER */}

                                            <td>

                                                <div className="member-profile">

                                                    <div className="member-avatar">
                                                        {getInitials(name)}
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {name}
                                                        </strong>

                                                        <small>
                                                            Library member
                                                        </small>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* STUDENT ID */}

                                            <td>

                                                <span className="student-id">
                                                    {studentId}
                                                </span>

                                            </td>


                                            {/* EMAIL */}

                                            <td>

                                                <span className="member-email">
                                                    {email}
                                                </span>

                                            </td>


                                            {/* PHONE */}

                                            <td>

                                                <span className="member-phone">
                                                    {phone}
                                                </span>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <button
                                                    className={`member-status ${getStatusClass(
                                                        status
                                                    )}`}
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            memberId,
                                                            status
                                                        )
                                                    }
                                                    title="Click to change status"
                                                >

                                                    <span className="member-status-dot"></span>

                                                    {status}

                                                </button>

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="member-actions">

                                                    <button
                                                        className="member-delete-btn"
                                                        onClick={() =>
                                                            handleDeleteMember(
                                                                memberId,
                                                                name
                                                            )
                                                        }
                                                        title="Delete member"
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


            {/* =================================================
                ADD MEMBER MODAL
            ================================================= */}

            {showAddForm && (

                <div
                    className="member-modal-overlay"
                    onMouseDown={(e) => {

                        if (e.target === e.currentTarget) {
                            setShowAddForm(false);
                        }

                    }}
                >

                    <div className="member-modal">

                        {/* MODAL HEADER */}

                        <div className="member-modal-header">

                            <div className="member-modal-title">

                                <div className="member-modal-icon">
                                    👥
                                </div>

                                <div>

                                    <h2>
                                        Add New Member
                                    </h2>

                                    <p>
                                        Register a new library member.
                                    </p>

                                </div>

                            </div>


                            <button
                                className="member-modal-close"
                                onClick={() =>
                                    setShowAddForm(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form onSubmit={handleAddMember}>

                            <div className="member-form-grid">

                                {/* STUDENT ID */}

                                <div className="member-form-group">

                                    <label>
                                        Student ID *
                                    </label>

                                    <input
                                        type="text"
                                        name="student_id"
                                        value={form.student_id}
                                        onChange={handleFormChange}
                                        placeholder="e.g. STU-001"
                                        required
                                    />

                                </div>


                                {/* NAME */}

                                <div className="member-form-group">

                                    <label>
                                        Full Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleFormChange}
                                        placeholder="e.g. Muhammad Ali"
                                        required
                                    />

                                </div>


                                {/* EMAIL */}

                                <div className="member-form-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleFormChange}
                                        placeholder="member@example.com"
                                    />

                                </div>


                                {/* PHONE */}

                                <div className="member-form-group">

                                    <label>
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleFormChange}
                                        placeholder="+92..."
                                    />

                                </div>


                                {/* PASSWORD */}

                                <div className="member-form-group">

                                    <label>
                                        Password *
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleFormChange}
                                        placeholder="Member login password"
                                        required
                                    />

                                </div>


                                {/* STATUS */}

                                <div className="member-form-group">

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


                                {/* ADDRESS */}

                                <div className="member-form-group full-width">

                                    <label>
                                        Address
                                    </label>

                                    <textarea
                                        name="address"
                                        value={form.address}
                                        onChange={handleFormChange}
                                        placeholder="Member address"
                                        rows="3"
                                    />

                                </div>

                            </div>


                            {/* MODAL ACTIONS */}

                            <div className="member-modal-actions">

                                <button
                                    type="button"
                                    className="member-cancel-btn"
                                    onClick={() =>
                                        setShowAddForm(false)
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="member-save-btn"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Creating..."
                                        : "Create Member"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Members;