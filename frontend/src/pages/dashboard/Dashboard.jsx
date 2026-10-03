import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:5000/api";

function Dashboard() {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const token = localStorage.getItem("access_token");

                const response = await axios.get(
                    `${API_URL}/dashboard/statistics`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log("DASHBOARD API RESPONSE:", response.data);

                if (response.data && response.data.data) {
                    setStatistics(response.data.data);
                } else {
                    setError("Invalid dashboard response.");
                }
            } catch (err) {
                console.error("DASHBOARD ERROR:", err);

                setError(
                    err.response?.data?.message ||
                    err.response?.data?.msg ||
                    "Unable to load dashboard statistics."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <h2>Unable to load dashboard</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!statistics) {
        return (
            <div className="dashboard-error">
                <h2>No dashboard data</h2>
                <p>Dashboard statistics are unavailable.</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            {/* HEADER */}
            <div className="dashboard-header">
                <div>
                    <span className="dashboard-label">
                        LIBRARY MANAGEMENT SYSTEM
                    </span>

                    <h1>Library Dashboard</h1>

                    <p>
                        Welcome back! Here's an overview of your library.
                    </p>
                </div>

                <div className="dashboard-date">
                    <span>📚</span>
                    <div>
                        <strong>Library Overview</strong>
                        <small>System Statistics</small>
                    </div>
                </div>
            </div>


            {/* STATISTICS */}
            <div className="stats-grid">

                <div className="stat-card">
                    <div className="stat-icon">📚</div>

                    <div className="stat-content">
                        <span>Total Books</span>
                        <h2>{statistics.total_books}</h2>
                        <small>Book titles</small>
                    </div>
                </div>


                <div className="stat-card">
                    <div className="stat-icon">📦</div>

                    <div className="stat-content">
                        <span>Book Copies</span>
                        <h2>{statistics.total_book_copies}</h2>
                        <small>Physical copies</small>
                    </div>
                </div>


                <div className="stat-card">
                    <div className="stat-icon">👥</div>

                    <div className="stat-content">
                        <span>Total Members</span>
                        <h2>{statistics.total_members}</h2>
                        <small>Registered members</small>
                    </div>
                </div>


                <div className="stat-card">
                    <div className="stat-icon">👤</div>

                    <div className="stat-content">
                        <span>System Users</span>
                        <h2>{statistics.total_users}</h2>
                        <small>Staff accounts</small>
                    </div>
                </div>


                <div className="stat-card">
                    <div className="stat-icon">📖</div>

                    <div className="stat-content">
                        <span>Borrowings</span>
                        <h2>{statistics.total_borrowings}</h2>
                        <small>Borrowing records</small>
                    </div>
                </div>


                <div className="stat-card">
                    <div className="stat-icon">💰</div>

                    <div className="stat-content">
                        <span>Fines</span>
                        <h2>{statistics.total_fines}</h2>
                        <small>Fine records</small>
                    </div>
                </div>

            </div>


            {/* QUICK SUMMARY */}
            <div className="dashboard-summary">

                <div className="summary-card">
                    <div className="summary-icon">📊</div>

                    <div>
                        <h3>Library Summary</h3>

                        <p>
                            Your library currently has{" "}
                            <strong>{statistics.total_books}</strong>{" "}
                            book titles and{" "}
                            <strong>{statistics.total_book_copies}</strong>{" "}
                            physical copies.
                        </p>
                    </div>
                </div>


                <div className="summary-card">
                    <div className="summary-icon">👥</div>

                    <div>
                        <h3>Members</h3>

                        <p>
                            There are currently{" "}
                            <strong>{statistics.total_members}</strong>{" "}
                            registered library members.
                        </p>
                    </div>
                </div>


                <div className="summary-card">
                    <div className="summary-icon">📋</div>

                    <div>
                        <h3>Activity</h3>

                        <p>
                            The system contains{" "}
                            <strong>{statistics.total_borrowings}</strong>{" "}
                            borrowing records.
                        </p>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default Dashboard;