import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="navbar">

            <div>
                <h3>Library Dashboard</h3>
            </div>

            <div className="navbar-user">

                <div>
                    <strong>{user?.name}</strong>

                    <span>{user?.role}</span>
                </div>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </header>
    );
};

export default Navbar;