import { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`https://prologis-hackathon.onrender.com/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        onLoginSuccess({ username: data?.username || username, token: data?.token, ...data });
      } else {
        setError(data?.detail || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => e.key === "Enter" && handleSubmit();

  return (
    <>
      {/* Full-bleed background */}
      <div className="bg-layer" aria-hidden />

      {/* Centered container */}
      <div className="shell-container">
        <div className="login-box" role="dialog" aria-labelledby="login-title">
          <div style={styles.header}>
            <div style={styles.icon} aria-hidden>📦</div>
            <div>
              <h1 id="login-title" style={styles.title} className="login-title">
                Prologis Inventory
              </h1>
              <p style={styles.subtitle}>ID: PL-2024-8451</p>
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={onKeyDown}
              style={styles.input}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onKeyDown}
              style={styles.input}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="login-button"
            disabled={loading}
            aria-busy={loading ? "true" : "false"}
          >
            {loading ? "Logging in…" : "Log In"}
          </button>
        </div>
      </div>

      {/* Component-scoped styles */}
      <style>{`
        :root {
          --bg-top: #475569;
          --bg-bottom: #1e293b;
          --mint: #2dd4bf;
          --mint-hover: #14b8a6;
          --card-shadow: 0 20px 60px rgba(0,0,0,0.25);
        }
        html, body, #root { height: 100%; margin: 0; padding: 0; }

        .bg-layer {
          position: fixed; inset: 0; width: 100vw; height: 100vh;
          background:
            radial-gradient(1200px 500px at 50% 30%, rgba(255,255,255,0.06), transparent),
            linear-gradient(135deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
          z-index: 0;
        }
        .shell-container {
          position: relative; z-index: 1;
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 20px; box-sizing: border-box;
        }
        .login-box {
          background: white; border-radius: 14px; box-shadow: var(--card-shadow);
          width: 100%; max-width: 500px; padding: clamp(30px, 5vw, 50px);
        }
        .login-button {
          width: 100%; background-color: var(--mint); color: white; padding: 14px;
          border: none; border-radius: 10px; font-size: 16px; font-weight: 700;
          transition: background-color 0.2s, opacity 0.2s; margin-top: 10px; cursor: pointer;
        }
        .login-button:hover:not(:disabled) { background-color: var(--mint-hover); }
        .login-button:disabled { opacity: .8; cursor: not-allowed; }

        input:focus {
          border-color: var(--mint) !important;
          box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2);
          outline: none;
        }
        @media (max-width: 768px) { .login-box { max-width: 450px; padding: 30px 25px; } .login-title { font-size: 24px !important; } }
        @media (max-width: 480px) { .login-box { max-width: 100%; padding: 25px 20px; } .login-title { font-size: 22px !important; } }
      `}</style>
    </>
  );
}

const styles = {
  header: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "28px", gap: "14px", textAlign: "center" },
  icon: { fontSize: "40px" },
  title: { fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: ".2px" },
  subtitle: { fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" },
  error: { backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" },
  formGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "8px" },
  input: { width: "100%", padding: "12px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "16px", boxSizing: "border-box", background: "#fff", transition: "border-color 0.2s, box-shadow 0.2s" },
};
