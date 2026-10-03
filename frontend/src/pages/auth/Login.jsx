import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


const Login = () => {

    const navigate = useNavigate();

    const { login } = useAuth();


    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setLoading(true);


        const result = await login(
            username,
            password
        );


        setLoading(false);


        if (result.success) {

            navigate("/dashboard");

        } else {

            setError(result.message);

        }

    };


    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >

            <form
                onSubmit={handleSubmit}
                style={{
                    width: "350px",
                    padding: "30px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                }}
            >

                <h2>
                    Library Management System
                </h2>

                <p>
                    Login to your account
                </p>


                {error && (

                    <p
                        style={{
                            color: "red",
                        }}
                    >
                        {error}
                    </p>

                )}


                <div>

                    <label>
                        Username
                    </label>

                    <input
                        type="text"
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "5px",
                            marginBottom: "15px",
                        }}
                    />

                </div>


                <div>

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "5px",
                            marginBottom: "15px",
                        }}
                    />

                </div>


                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "10px",
                    }}
                >

                    {loading
                        ? "Logging in..."
                        : "Login"
                    }

                </button>

            </form>

        </div>

    );

};


export default Login;