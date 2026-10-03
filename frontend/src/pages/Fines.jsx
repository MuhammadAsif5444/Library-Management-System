import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Fines.css";

const API_URL = "http://127.0.0.1:5000/api";
const FINES_URL = `${API_URL}/fines`;

export default function Fines() {
    const [fines, setFines] = useState([]);
    const [borrowings, setBorrowings] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [editingFine, setEditingFine] = useState(null);

    const emptyForm = {
        borrowing_id: "",
        amount: "",
        days_overdue: 0,
        reason: "",
        status: "UNPAID",
    };

    const [form, setForm] = useState(emptyForm);

    const getToken = () => {
        return localStorage.getItem("access_token");
    };

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    // -----------------------------------------------------
    // LOAD FINES
    // -----------------------------------------------------

    const loadFines = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                FINES_URL,
                authConfig()
            );

            console.log(
                "Fines API response:",
                response.data
            );

            const data =
                response.data?.fines ||
                response.data?.data ||
                [];

            setFines(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "Failed to load fines:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to load fines."
            );
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------------------------------
    // LOAD BORROWINGS
    // -----------------------------------------------------

    const loadBorrowings = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/borrowings/`,
                authConfig()
            );

            console.log(
                "Borrowings API response:",
                response.data
            );

            const data =
                response.data?.borrowings ||
                response.data?.data ||
                response.data ||
                [];

            setBorrowings(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "Failed to load borrowings:",
                err
            );
        }
    };

    useEffect(() => {
        loadFines();
        loadBorrowings();
    }, []);

    // -----------------------------------------------------
    // FILTER
    // -----------------------------------------------------

    const filteredFines = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        return fines.filter((fine) => {
            const matchesSearch =
                !keyword ||
                String(fine.fine_id || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(fine.borrowing_id || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(fine.member_name || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(fine.book_title || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(fine.reason || "")
                    .toLowerCase()
                    .includes(keyword);

            const status =
                String(
                    fine.status || ""
                ).toUpperCase();

            const matchesStatus =
                statusFilter === "ALL" ||
                status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [fines, search, statusFilter]);

    // -----------------------------------------------------
    // STATISTICS
    // -----------------------------------------------------

    const totalFines = fines.length;

    const unpaidFines = fines.filter(
        (fine) =>
            String(fine.status || "")
                .toUpperCase() === "UNPAID"
    );

    const paidFines = fines.filter(
        (fine) =>
            String(fine.status || "")
                .toUpperCase() === "PAID"
    );

    const waivedFines = fines.filter(
        (fine) =>
            String(fine.status || "")
                .toUpperCase() === "WAIVED"
    );

    const totalAmount = fines.reduce(
        (sum, fine) =>
            sum + Number(fine.amount || 0),
        0
    );

    const unpaidAmount = unpaidFines.reduce(
        (sum, fine) =>
            sum + Number(fine.amount || 0),
        0
    );

    // -----------------------------------------------------
    // MODAL
    // -----------------------------------------------------

    const openAddModal = () => {
        setEditingFine(null);
        setForm(emptyForm);
        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const openEditModal = (fine) => {
        setEditingFine(fine);

        setForm({
            borrowing_id: fine.borrowing_id || "",
            amount: fine.amount ?? "",
            days_overdue: fine.days_overdue ?? 0,
            reason: fine.reason || "",
            status: fine.status || "UNPAID",
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingFine(null);
        setForm(emptyForm);
        setError("");
    };

    // -----------------------------------------------------
    // FORM CHANGE
    // -----------------------------------------------------

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // -----------------------------------------------------
    // CREATE / UPDATE
    // -----------------------------------------------------

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!editingFine && !form.borrowing_id) {
            setError(
                "Please select a borrowing."
            );
            return;
        }

        if (
            form.amount === "" ||
            Number(form.amount) < 0
        ) {
            setError(
                "Please enter a valid fine amount."
            );
            return;
        }

        if (
            form.days_overdue === "" ||
            Number(form.days_overdue) < 0
        ) {
            setError(
                "Please enter valid overdue days."
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                amount: Number(form.amount),
                days_overdue: Number(
                    form.days_overdue
                ),
                reason:
                    String(
                        form.reason || ""
                    ).trim() || null,
                status:
                    form.status || "UNPAID",
            };

            if (!editingFine) {
                payload.borrowing_id =
                    Number(form.borrowing_id);

                console.log(
                    "Creating fine:",
                    payload
                );

                const response =
                    await axios.post(
                        FINES_URL,
                        payload,
                        authConfig()
                    );

                console.log(
                    "Create fine response:",
                    response.data
                );

                const newFine =
                    response.data?.fine;

                if (newFine) {
                    setFines(
                        (previous) => [
                            newFine,
                            ...previous,
                        ]
                    );
                } else {
                    await loadFines();
                }

                setSuccess(
                    "Fine created successfully."
                );
            } else {
                console.log(
                    "Updating fine:",
                    payload
                );

                const response =
                    await axios.put(
                        `${FINES_URL}/${editingFine.fine_id}`,
                        payload,
                        authConfig()
                    );

                console.log(
                    "Update fine response:",
                    response.data
                );

                const updatedFine =
                    response.data?.fine;

                if (updatedFine) {
                    setFines(
                        (previous) =>
                            previous.map(
                                (item) =>
                                    item.fine_id ===
                                    updatedFine.fine_id
                                        ? updatedFine
                                        : item
                            )
                    );
                } else {
                    await loadFines();
                }

                setSuccess(
                    "Fine updated successfully."
                );
            }

            setShowModal(false);
            setEditingFine(null);
            setForm(emptyForm);
        } catch (err) {
            console.error(
                "Fine save error:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to save fine."
            );
        } finally {
            setSaving(false);
        }
    };

    // -----------------------------------------------------
    // DELETE
    // -----------------------------------------------------

    const handleDelete = async (fineId) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this fine?"
            );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await axios.delete(
                `${FINES_URL}/${fineId}`,
                authConfig()
            );

            setFines(
                (previous) =>
                    previous.filter(
                        (fine) =>
                            fine.fine_id !== fineId
                    )
            );

            setSuccess(
                "Fine deleted successfully."
            );
        } catch (err) {
            console.error(
                "Delete fine error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to delete fine."
            );
        }
    };

    // -----------------------------------------------------
    // BORROWING LABEL
    // -----------------------------------------------------

    const getBorrowingLabel = (borrowing) => {
        if (!borrowing) {
            return "Borrowing";
        }

        const member =
            borrowing.member_name ||
            borrowing.member?.name ||
            "Member";

        const book =
            borrowing.book_title ||
            borrowing.book?.title ||
            "Book";

        return `#${borrowing.borrowing_id} — ${member} — ${book}`;
    };

    // -----------------------------------------------------
    // RENDER
    // -----------------------------------------------------

    return (
        <section className="fines-page">

            {/* HEADER */}
            <div className="fines-header">
                <div>
                    <span className="fines-eyebrow">
                        FINANCIAL MANAGEMENT
                    </span>

                    <h1>Fines</h1>

                    <p>
                        Track overdue charges,
                        payments and fine
                        statuses.
                    </p>
                </div>

                <div className="fines-header-actions">
                    <button
                        className="fines-refresh-btn"
                        onClick={loadFines}
                        disabled={loading}
                    >
                        <span>↻</span>
                        Refresh
                    </button>

                    <button
                        className="add-fine-btn"
                        onClick={openAddModal}
                    >
                        <span>＋</span>
                        Add Fine
                    </button>
                </div>
            </div>

            {/* SUCCESS */}
            {success && (
                <div className="fines-success">
                    ✓ {success}
                </div>
            )}

            {/* ERROR */}
            {error && !showModal && (
                <div className="fines-error">
                    ⚠️ {error}
                </div>
            )}

            {/* STATISTICS */}
            <div className="fine-stat-grid">

                <article className="fine-stat-card">
                    <div className="fine-stat-icon total">
                        💰
                    </div>

                    <div>
                        <span>Total Fines</span>

                        <strong>
                            {totalFines.toLocaleString()}
                        </strong>

                        <small>
                            {totalAmount.toFixed(2)} total amount
                        </small>
                    </div>
                </article>

                <article className="fine-stat-card">
                    <div className="fine-stat-icon unpaid">
                        ⚠️
                    </div>

                    <div>
                        <span>Unpaid</span>

                        <strong>
                            {unpaidFines.length.toLocaleString()}
                        </strong>

                        <small>
                            {unpaidAmount.toFixed(2)} outstanding
                        </small>
                    </div>
                </article>

                <article className="fine-stat-card">
                    <div className="fine-stat-icon paid">
                        ✅
                    </div>

                    <div>
                        <span>Paid</span>

                        <strong>
                            {paidFines.length.toLocaleString()}
                        </strong>

                        <small>
                            successfully settled
                        </small>
                    </div>
                </article>

                <article className="fine-stat-card">
                    <div className="fine-stat-icon waived">
                        🏷️
                    </div>

                    <div>
                        <span>Waived</span>

                        <strong>
                            {waivedFines.length.toLocaleString()}
                        </strong>

                        <small>
                            charges waived
                        </small>
                    </div>
                </article>

            </div>

            {/* MAIN CARD */}
            <div className="fines-card">

                <div className="fines-card-header">
                    <div>
                        <h2>Fine Directory</h2>

                        <p>
                            Search and manage
                            library fines.
                        </p>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="fines-toolbar">

                    <div className="fines-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search by fine ID, borrowing, member, book or reason..."
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

                        <option value="UNPAID">
                            Unpaid
                        </option>

                        <option value="PAID">
                            Paid
                        </option>

                        <option value="WAIVED">
                            Waived
                        </option>
                    </select>

                    <div className="fines-result-count">
                        {filteredFines.length}{" "}
                        {filteredFines.length === 1
                            ? "fine"
                            : "fines"}
                    </div>

                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="fines-loading">
                        <div className="fines-spinner"></div>

                        <span>
                            Loading fines...
                        </span>
                    </div>
                ) : filteredFines.length === 0 ? (
                    <div className="fines-empty">

                        <div className="fines-empty-icon">
                            💰
                        </div>

                        <h3>
                            {search
                                ? "No fines found"
                                : "No fines available"}
                        </h3>

                        <p>
                            {search
                                ? "Try a different search term."
                                : "Add your first fine to get started."}
                        </p>

                    </div>
                ) : (
                    <div className="fines-table-wrapper">

                        <table className="fines-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Member</th>
                                    <th>Book</th>
                                    <th>Amount</th>
                                    <th>Overdue</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredFines.map(
                                    (fine) => {

                                        const status =
                                            String(
                                                fine.status ||
                                                "UNPAID"
                                            ).toUpperCase();

                                        return (
                                            <tr
                                                key={
                                                    fine.fine_id
                                                }
                                            >

                                                <td>
                                                    <span className="fine-id">
                                                        #
                                                        {
                                                            fine.fine_id
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="fine-profile">
                                                        <div className="fine-avatar">
                                                            {(
                                                                fine.member_name ||
                                                                "M"
                                                            )
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    fine.member_name ||
                                                                    "Unknown Member"
                                                                }
                                                            </strong>

                                                            <small>
                                                                Borrowing #
                                                                {
                                                                    fine.borrowing_id
                                                                }
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="fine-book">
                                                        {fine.book_title ||
                                                            "Unknown Book"}
                                                    </div>
                                                </td>

                                                <td>
                                                    <strong className="fine-amount">
                                                        {Number(
                                                            fine.amount ||
                                                            0
                                                        ).toFixed(2)}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="fine-days">
                                                        {Number(
                                                            fine.days_overdue ||
                                                            0
                                                        )}{" "}
                                                        days
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="fine-reason">
                                                        {fine.reason ||
                                                            "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`fine-status fine-status-${status.toLowerCase()}`}
                                                    >
                                                        <span className="fine-status-dot"></span>

                                                        {status}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="fine-actions">

                                                        <button
                                                            type="button"
                                                            className="fine-edit-btn"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    fine
                                                                )
                                                            }
                                                            title="Edit fine"
                                                        >
                                                            ✏️
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="fine-delete-btn"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    fine.fine_id
                                                                )
                                                            }
                                                            title="Delete fine"
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

            {/* MODAL */}
            {showModal && (
                <div
                    className="fine-modal-overlay"
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

                    <div className="fine-modal">

                        <div className="fine-modal-header">

                            <div className="fine-modal-title">

                                <div className="fine-modal-icon">
                                    💰
                                </div>

                                <div>
                                    <h2>
                                        {editingFine
                                            ? "Edit Fine"
                                            : "Add Fine"}
                                    </h2>

                                    <p>
                                        {editingFine
                                            ? "Update fine information."
                                            : "Create a new library fine."}
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                className="fine-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="fine-form-grid">

                                {!editingFine && (
                                    <div className="fine-form-group full">

                                        <label>
                                            Borrowing *
                                        </label>

                                        <select
                                            name="borrowing_id"
                                            value={
                                                form.borrowing_id ||
                                                ""
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
                                                (
                                                    borrowing
                                                ) => (
                                                    <option
                                                        key={
                                                            borrowing.borrowing_id
                                                        }
                                                        value={
                                                            borrowing.borrowing_id
                                                        }
                                                    >
                                                        {getBorrowingLabel(
                                                            borrowing
                                                        )}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                    </div>
                                )}

                                <div className="fine-form-group">

                                    <label>
                                        Fine Amount *
                                    </label>

                                    <input
                                        type="number"
                                        name="amount"
                                        value={
                                            form.amount
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g. 100"
                                        required
                                    />

                                </div>

                                <div className="fine-form-group">

                                    <label>
                                        Days Overdue
                                    </label>

                                    <input
                                        type="number"
                                        name="days_overdue"
                                        value={
                                            form.days_overdue
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        placeholder="e.g. 5"
                                    />

                                </div>

                                <div className="fine-form-group">

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
                                        <option value="UNPAID">
                                            Unpaid
                                        </option>

                                        <option value="PAID">
                                            Paid
                                        </option>

                                        <option value="WAIVED">
                                            Waived
                                        </option>
                                    </select>

                                </div>

                                <div className="fine-form-group">

                                    <label>
                                        Reason
                                    </label>

                                    <input
                                        type="text"
                                        name="reason"
                                        value={
                                            form.reason
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Book returned late"
                                        maxLength="255"
                                    />

                                </div>

                            </div>

                            {error && (
                                <div className="fine-form-error">
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="fine-modal-actions">

                                <button
                                    type="button"
                                    className="fine-cancel-btn"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="fine-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingFine
                                            ? "Update Fine"
                                            : "Add Fine"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </section>
    );
}