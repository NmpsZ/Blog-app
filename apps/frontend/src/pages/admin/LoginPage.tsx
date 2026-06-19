import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { errorMessage } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/admin/blogs";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await auth.login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto w-full mt-24">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif text-ink tracking-tight mb-2">Admin Access</h1>
        <p className="text-ink-muted text-sm uppercase tracking-widest">Sign in to the sanctuary</p>
      </div>
      
      <div className="bg-surface border border-divider shadow-sm rounded-none p-10 w-full max-w-md">
        <h1 className="text-4xl font-serif text-ink tracking-tight mb-8 text-center">เข้าสู่ระบบ (Login)</h1>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 text-brand p-4 mb-6 text-sm">
            {error}
          </div>
        ) : null}

        <form onSubmit={submit} className="grid gap-6">
          <label className="grid gap-2 text-xs tracking-widest uppercase font-semibold text-ink-muted">
            ชื่อผู้ใช้ (Username)
            <input
              className="w-full bg-surface border border-divider rounded-none text-ink px-4 py-3 focus:outline-none focus:border-brand transition-colors font-sans font-normal normal-case tracking-normal text-base"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>
          <label className="grid gap-2 text-xs tracking-widest uppercase font-semibold text-ink-muted">
            รหัสผ่าน (Password)
            <input
              type="password"
              className="w-full bg-surface border border-divider rounded-none text-ink px-4 py-3 focus:outline-none focus:border-brand transition-colors font-sans font-normal normal-case tracking-normal text-base"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center px-8 py-4 mt-2 rounded-none font-medium text-surface bg-brand hover:bg-brand-hover transition-colors duration-200 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "กำลังเข้าสู่ระบบ... (Logging in...)" : "เข้าสู่ระบบ (Login)"}
          </button>
        </form>
      </div>
    </div>
  );
}
