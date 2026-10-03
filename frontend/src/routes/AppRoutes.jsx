import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Users from "../pages/Users";
import Members from "../pages/Members";
import Books from "../pages/Books";
import BookCopies from "../pages/BookCopies";
import Borrowings from "../pages/Borrowings";
import Authors from "../pages/Authors";
import Categories from "../pages/Categories";
import Fines from "../pages/Fines";
import Returns from "../pages/Returns";
import Reports from "../pages/Reports";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";

const ProtectedPage = ({ children }) => (
    <ProtectedRoute><DashboardLayout>{children}</DashboardLayout></ProtectedRoute>
);

const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
            <Route path="/users" element={<ProtectedPage><Users /></ProtectedPage>} />
            <Route path="/members" element={<ProtectedPage><Members /></ProtectedPage>} />
            <Route path="/authors" element={<ProtectedPage><Authors /></ProtectedPage>} />
            <Route path="/categories" element={<ProtectedPage><Categories /></ProtectedPage>} />
            <Route path="/books" element={<ProtectedPage><Books /></ProtectedPage>} />
            <Route path="/book-copies" element={<ProtectedPage><BookCopies /></ProtectedPage>} />
            <Route path="/borrowings" element={<ProtectedPage><Borrowings /></ProtectedPage>} />
            <Route path="/returns" element={<ProtectedPage><Returns /></ProtectedPage>} />
            <Route path="/fines" element={<ProtectedPage><Fines /></ProtectedPage>} />
            <Route path="/reports" element={<ProtectedPage><Reports /></ProtectedPage>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;
