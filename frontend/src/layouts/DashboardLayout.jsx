import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
    ["📊", "Dashboard", "/dashboard"],
    ["👥", "Users", "/users"],
    ["🪪", "Members", "/members"],
    ["✍️", "Authors", "/authors"],
    ["🗂️", "Categories", "/categories"],
    ["📚", "Books", "/books"],
    ["📦", "Book Copies", "/book-copies"],
    ["🔄", "Borrowings", "/borrowings"],
    ["↩️", "Returns", "/returns"],
    ["💰", "Fines", "/fines"],
    ["📑", "Reports", "/reports"],
];

export default function Sidebar() {
    const { user } = useAuth();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-mark">📚</div>

                <div>
                    <strong>LibraryOS</strong>
                    <span>Management System</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {links.map(([icon, label, to]) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        <span className="nav-icon">
                            {icon}
                        </span>

                        <span>
                            {label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-user">
                <div className="avatar">
                    {(user?.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                </div>

                <div>
                    <strong>
                        {user?.name || "User"}
                    </strong>

                    <span>
                        {user?.role || "Member"}
                    </span>
                </div>
            </div>
        </aside>
    );
}