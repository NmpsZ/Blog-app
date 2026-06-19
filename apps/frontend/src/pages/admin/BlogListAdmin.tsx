import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage } from "../../services/api";
import type { ApiResponse, Blog } from "../../types";

type AdminBlog = Blog & {
  _count?: {
    comments: number;
  };
};

export default function BlogListAdmin() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<AdminBlog[]>>("/api/admin/blogs");
      return response.data.data;
    }
  });

  const togglePublish = useMutation({
    mutationFn: (id: number) => api.patch(`/api/admin/blogs/${id}/publish`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blogs"] })
  });

  const deleteBlog = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/blogs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blogs"] })
  });

  function handleDelete(id: number) {
    setDeleteId(id);
  }

  function confirmDelete() {
    if (deleteId !== null) {
      deleteBlog.mutate(deleteId);
      setDeleteId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 border-b border-divider pb-6">
        <h1 className="text-4xl font-serif text-ink tracking-tight">จัดการบทความ (Manage Articles)</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link className="inline-flex items-center justify-center px-6 py-3 rounded-none font-medium text-ink bg-transparent border border-divider hover:border-brand hover:text-brand transition-colors duration-200 uppercase tracking-widest text-xs" to="/admin/comments">
            จัดการความคิดเห็น (Comments)
          </Link>
          <Link className="inline-flex items-center justify-center px-6 py-3 rounded-none font-medium text-surface bg-brand hover:bg-brand-hover transition-colors duration-200 uppercase tracking-widest text-xs" to="/admin/blogs/new">
            + สร้างบทความใหม่ (New Article)
          </Link>
        </div>
      </div>

      {query.isError ? <p className="bg-red-50 border border-red-200 text-brand p-4 mb-8 text-sm">{errorMessage(query.error)}</p> : null}
      {togglePublish.isError ? <p className="bg-red-50 border border-red-200 text-brand p-4 mb-8 text-sm">{errorMessage(togglePublish.error)}</p> : null}
      {deleteBlog.isError ? <p className="bg-red-50 border border-red-200 text-brand p-4 mb-8 text-sm">{errorMessage(deleteBlog.error)}</p> : null}

      <div className="bg-surface border border-divider shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="bg-paper border-b border-divider px-6 py-4 text-xs font-semibold text-ink-muted uppercase tracking-widest">หัวข้อ (Title)</th>
              <th className="bg-paper border-b border-divider px-6 py-4 text-xs font-semibold text-ink-muted uppercase tracking-widest">สถานะ (Status)</th>
              <th className="bg-paper border-b border-divider px-6 py-4 text-xs font-semibold text-ink-muted uppercase tracking-widest">เข้าชม (Views)</th>
              <th className="bg-paper border-b border-divider px-6 py-4 text-xs font-semibold text-ink-muted uppercase tracking-widest">วันที่ (Date)</th>
              <th className="bg-paper border-b border-divider px-6 py-4 text-xs font-semibold text-ink-muted uppercase tracking-widest text-right">จัดการ (Actions)</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.map((blog) => (
              <tr key={blog.id} className="border-b border-divider last:border-0 hover:bg-paper transition-colors">
                <td className="px-6 py-5 align-middle">
                  <p className="font-serif font-bold text-ink text-lg">{blog.title}</p>
                  <p className="text-ink-muted text-sm">{blog.slug}</p>
                </td>
                <td className="px-6 py-5 align-middle">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-widest ${blog.published ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-paper text-ink-muted border border-divider'}`}>
                    {blog.published ? "เผยแพร่ (Published)" : "ไม่ได้เผยแพร่ (Unpublished)"}
                  </span>
                </td>
                <td className="px-6 py-5 align-middle text-ink font-medium">{blog.viewCount}</td>
                <td className="px-6 py-5 align-middle text-ink-muted text-sm">{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-5 align-middle text-right">
                  <div className="flex justify-end gap-3">
                    <button type="button" className="text-xs font-semibold uppercase tracking-widest text-ink hover:text-brand transition-colors" onClick={() => togglePublish.mutate(blog.id)}>
                      {blog.published ? "ซ่อน (Unpublish)" : "เผยแพร่ (Publish)"}
                    </button>
                    <span className="text-divider">|</span>
                    <Link to={`/admin/blogs/${blog.id}/edit`} className="text-xs font-semibold uppercase tracking-widest text-ink hover:text-brand transition-colors">
                      แก้ไข (Edit)
                    </Link>
                    <span className="text-divider">|</span>
                    <button type="button" className="text-xs font-semibold uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors" onClick={() => handleDelete(blog.id)}>
                      ลบ (Delete)
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {query.isLoading ? <p className="text-ink-muted text-sm mt-8 text-center uppercase tracking-widest">Loading...</p> : null}
      {query.data?.length === 0 ? <p className="text-ink-muted text-sm mt-8 text-center uppercase tracking-widest">No articles yet.</p> : null}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="bg-surface p-8 max-w-sm w-full shadow-xl border border-divider">
            <h3 className="text-2xl font-serif text-ink mb-4">ยืนยันการลบ<br/><span className="text-lg text-ink-muted">(Confirm Delete)</span></h3>
            <p className="text-ink-muted text-sm leading-relaxed mb-8">คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้? การกระทำนี้ไม่สามารถย้อนกลับได้ (This action cannot be undone)</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteId(null)} className="px-6 py-3 border border-divider text-ink hover:bg-paper transition-colors text-xs font-semibold uppercase tracking-widest">
                ยกเลิก (Cancel)
              </button>
              <button type="button" onClick={confirmDelete} className="px-6 py-3 bg-red-600 text-surface hover:bg-red-700 transition-colors text-xs font-semibold uppercase tracking-widest">
                ลบ (Delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
