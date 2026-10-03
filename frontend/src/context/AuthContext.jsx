import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export const useAuth = () => {
return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

const getCurrentUser = async () => {
    try {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setUser(null);
            return null;
        }

        const response = await api.get("/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setUser(response.data);
        return response.data;

    } catch (error) {
        console.error(
            "Failed to get current user:",
            error.response?.data || error.message
        );

        localStorage.removeItem("access_token");
        setUser(null);
        return null;

    } finally {
        setLoading(false);
    }
};

const login = async (username, password) => {
    try {
        setLoading(true);

        const response = await api.post("/auth/login", {
            username,
            password,
        });

        const token = response.data.access_token;

        if (!token) {
            throw new Error("Access token was not received");
        }

        localStorage.setItem("access_token", token);

        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return {
                success: false,
                message: "Login succeeded, but user information could not be loaded.",
            };
        }

        return {
            success: true,
        };

    } catch (error) {
        localStorage.removeItem("access_token");
        setUser(null);

        return {
            success: false,
            message:
                error.response?.data?.message ||
                error.response?.data?.msg ||
                error.message ||
                "Login failed",
        };

    } finally {
        setLoading(false);
    }
};

const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    setLoading(false);
};

useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
        getCurrentUser();
    } else {
        setLoading(false);
    }
}, []);

return (
    <AuthContext.Provider
        value={{
            user,
            loading,
            login,
            logout,
            getCurrentUser,
        }}
    >
        {children}
    </AuthContext.Provider>
);

};