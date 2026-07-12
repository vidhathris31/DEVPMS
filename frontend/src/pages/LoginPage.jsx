import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Card, Input, Btn, FL } from "../components/ui/Primitives";

export default function LoginPage() {
  const T = useTheme();
  const { login, isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!initializing && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, fontFamily: T.sans }}>
      <div style={{ width: "100%", maxWidth: 400, padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${T.blue},${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", margin: "0 auto 12px", boxShadow: `0 0 24px ${T.blue}50` }}>◈</div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: T.t1, letterSpacing: 1, textTransform: "uppercase", fontFamily: T.mono }}>DevPMS</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: T.t3, fontFamily: T.mono }}>IT Project Management Suite</p>
        </div>
        <Card>
          <form onSubmit={submit}>
            <FL label="Email" required>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </FL>
            <FL label="Password" required>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </FL>
            {error && <p style={{ color: T.red, fontSize: 12, fontFamily: T.mono, margin: "0 0 12px" }}>{error}</p>}
            <Btn type="submit" disabled={loading || !email || !password} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? "Signing in…" : "Sign In"}
            </Btn>
          </form>
        </Card>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: T.t3, fontFamily: T.mono }}>
          No account?{" "}
          <Link to="/register" style={{ color: T.blue }}>
            Create one
          </Link>
        </p>
        <p style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: T.t4, fontFamily: T.mono }}>Demo: admin@devpms.io / password123 (after running the seed script)</p>
      </div>
    </div>
  );
}
