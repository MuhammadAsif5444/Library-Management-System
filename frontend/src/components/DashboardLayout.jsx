import Sidebar from "./layout/Sidebar";
import Navbar from "./layout/Navbar";

const DashboardLayout = ({ children }) => {
    return (
        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Navbar />

                <main className="dashboard-content">
                    {children}
                </main>

            </div>

        </div>
    );
};

export default DashboardLayout;