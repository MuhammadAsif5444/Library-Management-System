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

                setLoading(true);

                setError("");

                const token =
                    localStorage.getItem("access_token");


                const response = await axios.get(
                    `${API_URL}/dashboard/statistics`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


                console.log(
                    "Dashboard API response:",
                    response.data
                );


                if (
                    response.data &&
                    response.data.data
                ) {

                    setStatistics(
                        response.data.data
                    );

                } else {

                    setError(
                        "Dashboard returned invalid data."
                    );
                }


            } catch (err) {

                console.error(
                    "Dashboard error:",
                    err
                );


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


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="dashboard-loading">

                <div className="dashboard-spinner"></div>

                <p>
                    Loading dashboard...
                </p>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="dashboard-error">

                <div className="dashboard-error-icon">
                    ⚠️
                </div>

                <h2>
                    Dashboard could not load
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={() =>
                        window.location.reload()
                    }
                >
                    Try Again
                </button>

            </div>

        );

    }


    // =====================================================
    // NO DATA
    // =====================================================

    if (!statistics) {

        return (

            <div className="dashboard-error">

                <div className="dashboard-error-icon">
                    📊
                </div>

                <h2>
                    No dashboard data
                </h2>

                <p>
                    No statistics were returned
                    from the server.
                </p>

            </div>

        );

    }


    // =====================================================
    // DASHBOARD
    // =====================================================

    return (

        <div className="dashboard-page">


            {/* HEADER */}

            <div className="dashboard-header">

                <div>

                    <p className="dashboard-welcome">
                        Welcome back 👋
                    </p>

                    <h1>
                        Library Dashboard
                    </h1>

                    <p>
                        Here's an overview of your
                        library today.
                    </p>

                </div>

            </div>


            {/* STATISTICS */}

            <div className="stats-grid">


                {/* BOOKS */}

                <div className="stat-card">

                    <div className="stat-icon books-icon">
                        📚
                    </div>

                    <div className="stat-content">

                        <span>
                            Total Books
                        </span>

                        <strong>
                            {statistics.total_books}
                        </strong>

                        <small>
                            Book titles
                        </small>

                    </div>

                </div>


                {/* COPIES */}

                <div className="stat-card">

                    <div className="stat-icon copies-icon">
                        📖
                    </div>

                    <div className="stat-content">

                        <span>
                            Book Copies
                        </span>

                        <strong>
                            {statistics.total_book_copies}
                        </strong>

                        <small>
                            Physical copies
                        </small>

                    </div>

                </div>


                {/* MEMBERS */}

                <div className="stat-card">

                    <div className="stat-icon members-icon">
                        👥
                    </div>

                    <div className="stat-content">

                        <span>
                            Members
                        </span>

                        <strong>
                            {statistics.total_members}
                        </strong>

                        <small>
                            Registered members
                        </small>

                    </div>

                </div>


                {/* USERS */}

                <div className="stat-card">

                    <div className="stat-icon users-icon">
                        👤
                    </div>

                    <div className="stat-content">

                        <span>
                            System Users
                        </span>

                        <strong>
                            {statistics.total_users}
                        </strong>

                        <small>
                            Active accounts
                        </small>

                    </div>

                </div>


                {/* BORROWINGS */}

                <div className="stat-card">

                    <div className="stat-icon borrowing-icon">
                        📚
                    </div>

                    <div className="stat-content">

                        <span>
                            Borrowings
                        </span>

                        <strong>
                            {statistics.total_borrowings}
                        </strong>

                        <small>
                            Total records
                        </small>

                    </div>

                </div>


                {/* FINES */}

                <div className="stat-card warning-card">

                    <div className="stat-icon fines-icon">
                        💰
                    </div>

                    <div className="stat-content">

                        <span>
                            Fines
                        </span>

                        <strong>
                            {statistics.total_fines}
                        </strong>

                        <small>
                            Fine records
                        </small>

                    </div>

                </div>


            </div>


            {/* SECONDARY INFORMATION */}

            <div className="dashboard-summary">


                <div className="summary-card">

                    <div>
                        <span>
                            Active Borrowings
                        </span>

                        <strong>
                            {statistics.active_borrowings}
                        </strong>
                    </div>

                    <span className="summary-icon">
                        📕
                    </span>

                </div>


                <div className="summary-card">

                    <div>
                        <span>
                            Overdue Books
                        </span>

                        <strong>
                            {statistics.overdue_borrowings}
                        </strong>
                    </div>

                    <span className="summary-icon">
                        ⚠️
                    </span>

                </div>


                <div className="summary-card">

                    <div>
                        <span>
                            Available Copies
                        </span>

                        <strong>
                            {statistics.available_copies}
                        </strong>
                    </div>

                    <span className="summary-icon">
                        ✅
                    </span>

                </div>


                <div className="summary-card">

                    <div>
                        <span>
                            Unpaid Fines
                        </span>

                        <strong>
                            {statistics.unpaid_fines}
                        </strong>
                    </div>

                    <span className="summary-icon">
                        💵
                    </span>

                </div>


            </div>


            {/* FOOTER MESSAGE */}

            <div className="dashboard-info">

                <div className="dashboard-info-icon">
                    💡
                </div>

                <div>

                    <h3>
                        Library Overview
                    </h3>

                    <p>
                        Monitor books, members,
                        borrowings, returns and
                        fines from one place.
                    </p>

                </div>

            </div>


        </div>

    );

}


export default Dashboard;