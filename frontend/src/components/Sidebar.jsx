import { NavLink } from "react-router-dom";

function Sidebar() {
return (
<aside className="sidebar">
<div className="logo">
📚 Library MS
</div>

        <nav className="sidebar-nav">
            <NavLink to="/">
                📊 Dashboard
            </NavLink>

            <NavLink to="/books">
                📚 Books
            </NavLink>

            <NavLink to="/book-copies">
                📦 Book Copies
            </NavLink>

            <NavLink to="/authors">
                ✍️ Authors
            </NavLink>

            <NavLink to="/categories">
                🗂️ Categories
            </NavLink>

            <NavLink to="/members">
                👥 Members
            </NavLink>

            <NavLink to="/borrowings">
                🔄 Borrowings
            </NavLink>

            <NavLink to="/returns">
                ↩️ Returns
            </NavLink>

            <NavLink to="/fines">
                💰 Fines
            </NavLink>

            <NavLink to="/users">
                👤 Users
            </NavLink>
        </nav>
    </aside>
);

}

export default Sidebar;