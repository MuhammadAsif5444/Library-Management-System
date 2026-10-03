import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
    ["/dashboard", "📊 Dashboard"],
    ["/users", "👤 Users"],
    ["/members", "👥 Members"],
    ["/authors", "✍️ Authors"],
    ["/categories", "🗂️ Categories"],
    ["/books", "📚 Books"],
    ["/book-copies", "📦 Book Copies"],
    ["/borrowings", "🔄 Borrowings"],
    ["/returns", "↩️ Returns"],
    ["/fines", "💰 Fines"],
    ["/reports", "📄 Reports"],
];

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">📚</div>

                <div>
                    <h2>Library</h2>
                    <span>Management System</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {links.map(([to, label]) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-user">
                <div className="sidebar-user-avatar">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                </div>

                <div>
                    <strong>{user?.name || "User"}</strong>
                    <span>{user?.role || ""}</span>
                </div>
            </div>

        </aside>
    );
};

export default Sidebar;