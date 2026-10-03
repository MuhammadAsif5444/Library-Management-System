import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Reports.css";

const API_URL = "http://127.0.0.1:5000/api";
const REPORTS_URL = `${API_URL}/reports`;

const reportTypes = [
    {
        key: "books",
        icon: "📚",
        title: "Books Report",
        description: "View the complete library book inventory.",
        endpoint: "/books",
        exportEndpoint: "/books/export",
        countKey: "total_books",
    },
    {
        key: "members",
        icon: "👥",
        title: "Members Report",
        description: "View registered library members.",
        endpoint: "/members",
        exportEndpoint: "/members/export",
        countKey: "total_members",
    },
    {
        key: "borrowings",
        icon: "🔄",
        title: "Borrowings Report",
        description: "View all borrowing transactions.",
        endpoint: "/borrowings",
        exportEndpoint: "/borrowings/export",
        countKey: "total_borrowings",
    },
    {
        key: "overdue",
        icon: "⚠️",
        title: "Overdue Report",
        description: "View books that are currently overdue.",
        endpoint: "/overdue",
        exportEndpoint: "/overdue/export",
        countKey: "total_overdue",
    },
    {
        key: "fines",
        icon: "💰",
        title: "Fines Report",
        description: "View all library fines and payments.",
        endpoint: "/fines",
        exportEndpoint: "/fines/export",
        countKey: "total_fines",
    },
];

export default function Reports() {
    const [selectedReport, setSelectedReport] = useState("books");
    const [reportData, setReportData] = useState([]);
    const [reportCount, setReportCount] = useState(0);

    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const currentReport = useMemo(
        () =>
            reportTypes.find(
                (report) => report.key === selectedReport
            ),
        [selectedReport]
    );

    const loadReport = async () => {
        if (!currentReport) return;

        try {
            setLoading(true);
            setError("");
            setSuccess("");
            setSearchTerm("");

            const token = localStorage.getItem("access_token");

            const response = await axios.get(
                `${REPORTS_URL}${currentReport.endpoint}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = response.data || {};

            setReportData(
                Array.isArray(data.data)
                    ? data.data
                    : []
            );

            setReportCount(
                Number(
                    data[currentReport.countKey] ??
                    data.data?.length ??
                    0
                )
            );
        } catch (err) {
            console.error("Failed to load report:", err);

            setReportData([]);
            setReportCount(0);

            setError(
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Unable to load report."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, [selectedReport]);

    const filteredData = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) {
            return reportData;
        }

        return reportData.filter((row) =>
            Object.values(row).some((value) =>
                String(value ?? "")
                    .toLowerCase()
                    .includes(search)
            )
        );
    }, [reportData, searchTerm]);

    const exportReport = async () => {
        if (!currentReport) return;

        try {
            setExporting(true);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("access_token");

            const response = await axios.get(
                `${REPORTS_URL}${currentReport.exportEndpoint}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: "blob",
                }
            );

            const blob = new Blob(
                [response.data],
                { type: "text/csv;charset=utf-8;" }
            );

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;

            const filename =
                `${selectedReport}_report.csv`;

            link.setAttribute("download", filename);

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

            setSuccess(
                `${currentReport.title} exported successfully.`
            );
        } catch (err) {
            console.error("Export failed:", err);

            setError(
                err.response?.data?.message ||
                "Unable to export report."
            );
        } finally {
            setExporting(false);
        }
    };

    const formatColumnName = (column) => {
        return column
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    const formatValue = (value, column) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        if (
            column === "amount" &&
            !Number.isNaN(Number(value))
        ) {
            return `Rs. ${Number(value).toFixed(2)}`;
        }

        return String(value);
    };

    const getStatusClass = (value) => {
        const status = String(value).toUpperCase();

        if (
            status === "PAID" ||
            status === "AVAILABLE" ||
            status === "ACTIVE" ||
            status === "RETURNED"
        ) {
            return "status-badge success";
        }

        if (
            status === "OVERDUE" ||
            status === "UNPAID" ||
            status === "INACTIVE"
        ) {
            return "status-badge danger";
        }

        if (
            status === "BORROWED" ||
            status === "WAIVED"
        ) {
            return "status-badge warning";
        }

        return "status-badge neutral";
    };

    const columns =
        reportData.length > 0
            ? Object.keys(reportData[0])
            : [];

    return (
        <div className="reports-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="reports-header">

                <div>
                    <span className="reports-eyebrow">
                        LIBRARY ANALYTICS
                    </span>

                    <h1>Reports</h1>

                    <p>
                        Generate, view and export
                        library management reports.
                    </p>
                </div>

                <button
                    className="reports-export-button"
                    onClick={exportReport}
                    disabled={
                        exporting ||
                        loading
                    }
                >
                    {exporting
                        ? "Exporting..."
                        : "⬇ Export CSV"}
                </button>

            </div>


            {/* =========================
                ALERTS
            ========================= */}

            {success && (
                <div className="reports-alert success-alert">
                    ✓ {success}
                </div>
            )}

            {error && (
                <div className="reports-alert error-alert">
                    ⚠ {error}
                </div>
            )}


            {/* =========================
                REPORT CARDS
            ========================= */}

            <div className="report-type-grid">

                {reportTypes.map((report) => (
                    <button
                        key={report.key}
                        className={`report-type-card ${
                            selectedReport === report.key
                                ? "selected"
                                : ""
                        }`}
                        onClick={() => {
                            setSelectedReport(
                                report.key
                            );
                            setSuccess("");
                        }}
                    >
                        <div className="report-card-icon">
                            {report.icon}
                        </div>

                        <div className="report-card-content">
                            <strong>
                                {report.title}
                            </strong>

                            <span>
                                {report.description}
                            </span>
                        </div>

                        <div className="report-card-count">
                            {selectedReport === report.key
                                ? reportCount
                                : "→"}
                        </div>
                    </button>
                ))}

            </div>


            {/* =========================
                MAIN REPORT CARD
            ========================= */}

            <div className="reports-main-card">

                <div className="reports-toolbar">

                    <div>
                        <h2>
                            {currentReport?.icon}{" "}
                            {currentReport?.title}
                        </h2>

                        <span>
                            {reportCount} record
                            {reportCount !== 1
                                ? "s"
                                : ""}
                        </span>
                    </div>

                    <div className="reports-toolbar-actions">

                        <div className="reports-search">
                            <span>🔍</span>

                            <input
                                type="text"
                                placeholder="Search report..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <button
                            className="refresh-button"
                            onClick={loadReport}
                            disabled={loading}
                        >
                            {loading
                                ? "Loading..."
                                : "↻ Refresh"}
                        </button>

                    </div>

                </div>


                {/* =========================
                    REPORT CONTENT
                ========================= */}

                {loading ? (
                    <div className="reports-loading">
                        <div className="loading-spinner"></div>
                        <p>
                            Loading report...
                        </p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="reports-empty">

                        <div className="reports-empty-icon">
                            {currentReport?.icon || "📊"}
                        </div>

                        <h3>
                            No records found
                        </h3>

                        <p>
                            {searchTerm
                                ? "Try changing your search."
                                : "There is no data available for this report yet."}
                        </p>

                    </div>
                ) : (
                    <div className="reports-table-wrapper">

                        <table className="reports-table">

                            <thead>
                                <tr>
                                    {columns.map(
                                        (column) => (
                                            <th key={column}>
                                                {formatColumnName(
                                                    column
                                                )}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>

                            <tbody>

                                {filteredData.map(
                                    (row, rowIndex) => (
                                        <tr
                                            key={
                                                row.id ||
                                                row.book_id ||
                                                row.member_id ||
                                                row.borrowing_id ||
                                                row.fine_id ||
                                                rowIndex
                                            }
                                        >
                                            {columns.map(
                                                (column) => {
                                                    const value =
                                                        row[
                                                            column
                                                        ];

                                                    const isStatus =
                                                        column ===
                                                        "status";

                                                    return (
                                                        <td
                                                            key={
                                                                column
                                                            }
                                                        >
                                                            {isStatus ? (
                                                                <span
                                                                    className={getStatusClass(
                                                                        value
                                                                    )}
                                                                >
                                                                    {formatValue(
                                                                        value,
                                                                        column
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                formatValue(
                                                                    value,
                                                                    column
                                                                )
                                                            )}
                                                        </td>
                                                    );
                                                }
                                            )}
                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

                {!loading &&
                    reportData.length > 0 && (
                        <div className="reports-footer">
                            Showing{" "}
                            <strong>
                                {filteredData.length}
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {reportData.length}
                            </strong>{" "}
                            records
                        </div>
                    )}

            </div>

        </div>
    );
}