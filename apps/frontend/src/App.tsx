import { useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import BlogDetailPage from "./pages/BlogDetailPage";
import BlogListPage from "./pages/BlogListPage";
import BlogFormPage from "./pages/admin/BlogFormPage";
import BlogListAdmin from "./pages/admin/BlogListAdmin";
import CommentListAdmin from "./pages/admin/CommentListAdmin";
import LoginPage from "./pages/admin/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function AppShell() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function logout() {
    localStorage.removeItem("adminToken");
    setIsMenuOpen(false);
    navigate("/admin/login");
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="bg-surface border-b border-divider px-6 py-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="font-serif font-bold text-2xl tracking-tight text-ink hover:text-brand transition-colors" onClick={closeMenu}>
            Blog App
          </Link>
          
          <button 
            type="button" 
            className="sm:hidden text-ink hover:text-brand p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <nav className="hidden sm:flex items-center gap-8">
            <Link to="/" className="text-ink-muted font-medium hover:text-brand transition-colors uppercase tracking-widest text-xs">หน้าหลัก (Public)</Link>
            <Link to="/admin/blogs" className="text-ink-muted font-medium hover:text-brand transition-colors uppercase tracking-widest text-xs">จัดการระบบ (Admin)</Link>
            {localStorage.getItem("adminToken") ? (
              <button type="button" className="text-ink-muted font-medium hover:text-brand transition-colors bg-transparent border-0 p-0 cursor-pointer uppercase tracking-widest text-xs" onClick={logout}>
                ออกจากระบบ (Logout)
              </button>
            ) : null}
          </nav>
        </div>

        {isMenuOpen && (
          <nav className="sm:hidden mt-4 flex flex-col gap-4 border-t border-divider pt-4">
            <Link to="/" className="text-ink-muted font-medium hover:text-brand transition-colors uppercase tracking-widest text-sm" onClick={closeMenu}>หน้าหลัก (Public)</Link>
            <Link to="/admin/blogs" className="text-ink-muted font-medium hover:text-brand transition-colors uppercase tracking-widest text-sm" onClick={closeMenu}>จัดการระบบ (Admin)</Link>
            {localStorage.getItem("adminToken") ? (
              <button type="button" className="text-ink-muted font-medium hover:text-brand transition-colors bg-transparent border-0 p-0 cursor-pointer uppercase tracking-widest text-sm text-left" onClick={logout}>
                ออกจากระบบ (Logout)
              </button>
            ) : null}
          </nav>
        )}
      </header>
      <main className="flex-1 px-6 pt-12 pb-24 lg:px-8 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin/blogs"
            element={
              <ProtectedRoute>
                <BlogListAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blogs/new"
            element={
              <ProtectedRoute>
                <BlogFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blogs/:id/edit"
            element={
              <ProtectedRoute>
                <BlogFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/comments"
            element={
              <ProtectedRoute>
                <CommentListAdmin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default AppShell;
