import { useState } from "react";
import { supabase } from "./supabase";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e) {
        e.preventDefault();

        setLoading(true);
        setError("");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError("Invalid email or password");
            setLoading(false);
            return;
        }
        

        onLogin(data.user);
        setLoading(false);
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-icon">🎬</div>

                <h1>Cinema Staff</h1>
                <p className="login-subtitle">
                    Sign in to manage cinema orders
                </p>

                <form onSubmit={handleLogin}>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <p className="login-error">{error}</p>
                    )}

                    <button
                        className="login-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="login-footer">
                    Cinema QR Ordering System
                </p>
            </div>
        </div>
    );
}

export default Login;