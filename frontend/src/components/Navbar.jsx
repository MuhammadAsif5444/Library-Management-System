import GlobalSearch from "./GlobalSearch";
import NotificationBell from "./NotificationBell";

function Navbar() {
    return (
        <header className="navbar">

            <div>
                <h2>Library Management System</h2>
            </div>

            <div className="navbar-actions">
                <GlobalSearch />
                <NotificationBell />

                <div className="user-profile">
                    👤 Admin
                </div>
            </div>

        </header>
    );
}

export default Navbar;