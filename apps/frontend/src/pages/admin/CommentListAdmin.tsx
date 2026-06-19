import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage } from "../../services/api";
import type { AdminComment, ApiResponse } from "../../types";

type Filter = "all" | "pending" | "approved";

export default function CommentListAdmin() {
  const [filter, setFilter] = useState<Filter>("all");
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-comments"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<AdminComment[]>>("/api/admin/comments");
      return response.data.data;
    }
  });

  const approve = useMutation({
    mutationFn: (id: number) => api.patch(`/api/admin/comments/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-comments"] })
  });

  const reject = useMutation({
    mutationFn: (id: number) => api.patch(`/api/admin/comments/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-comments"] })
  });

  const comments = useMemo(() => {
    const data = query.data ?? [];
    if (filter === "approved") return data.filter((comment) => comment.approved);
    if (filter === "pending") return data.filter((comment) => !comment.approved);
    return data;
  }, [filter, query.data]);

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-divider pb-6">
        <h1 className="text-4xl font-serif text-ink tracking-tight">จัดการความคิดเห็น (Manage Comments)</h1>
        <Link className="inline-flex items-center justify-center px-6 py-3 rounded-none font-medium text-ink bg-transparent border border-divider hover:border-brand hover:text-brand transition-colors duration-200 uppercase tracking-widest text-xs" to="/admin/blogs">
          กลับไปหน้ารวมบทความ (Back to Articles)
        </Link>
      </div>
      
      <div className="flex overflow-x-auto whitespace-nowrap gap-4 mb-8 border-b border-divider hide-scrollbar">
        <button className={`px-6 py-4 text-xs tracking-widest uppercase font-semibold transition-colors bg-transparent border-b-2 ${filter === "all" ? "text-ink border-brand" : "text-ink-muted border-transparent hover:text-ink"}`} type="button" onClick={() => setFilter("all")}>
          ทั้งหมด (All)
        </button>
        <button className={`px-6 py-4 text-xs tracking-widest uppercase font-semibold transition-colors bg-transparent border-b-2 ${filter === "pending" ? "text-ink border-brand" : "text-ink-muted border-transparent hover:text-ink"}`} type="button" onClick={() => setFilter("pending")}>
          รออนุมัติ (Pending)
        </button>
        <button className={`px-6 py-4 text-xs tracking-widest uppercase font-semibold transition-colors bg-transparent border-b-2 ${filter === "approved" ? "text-ink border-brand" : "text-ink-muted border-transparent hover:text-ink"}`} type="button" onClick={() => setFilter("approved")}>
          อนุมัติแล้ว (Approved)
        </button>
      </div>
      
      {query.isError ? <p className="bg-red-50 border border-red-200 text-brand p-4 mb-8 text-sm">{errorMessage(query.error)}</p> : null}
      {approve.isError ? <p className="bg-red-50 border border-red-200 text-brand p-4 mb-8 text-sm">{errorMessage(approve.error)}</p> : null}
      {reject.isError ? <p className="bg-red-50 border border-red-200 text-brand p-4 mb-8 text-sm">{errorMessage(reject.error)}</p> : null}
      
      <div className="bg-surface border border-divider shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="bg-paper border-b border-divider px-6 py-4 text-xs font-semibold text-ink-muted uppercase tracking-widest">บทความ (Article)</th>
              <th className="bg-paper border-b border-divider px-6 py-4 text-xs font-semibold text-ink-muted uppercase tracking-widest">ชื่อ (Name)</th>
              <th className="bg-paper border-b border-divider px-6 py-4 text-xs font-semibold text-ink-muted uppercase tracking-widest">ข้อความ (Message)</th>
              <th className="bg-paper border-b border-divider px-6 py-4 text-xs font-semibold text-ink-muted uppercase tracking-widest">สถานะ (Status)</th>
              <th className="bg-paper border-b border-divider px-6 py-4 text-xs font-semibold text-ink-muted uppercase tracking-widest">วันที่ (Date)</th>
              <th className="bg-paper border-b border-divider px-6 py-4 text-xs font-semibold text-ink-muted uppercase tracking-widest text-right">จัดการ (Actions)</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id} className="border-b border-divider last:border-0 hover:bg-paper transition-colors">
                <td className="px-6 py-5 align-middle font-serif text-lg font-bold text-ink">{comment.blog.title}</td>
                <td className="px-6 py-5 align-middle text-ink font-medium">{comment.name}</td>
                <td className="px-6 py-5 align-middle text-ink-muted max-w-xs truncate">{comment.message}</td>
                <td className="px-6 py-5 align-middle">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-widest ${comment.approved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {comment.approved ? "อนุมัติแล้ว (Approved)" : "รออนุมัติ (Pending)"}
                  </span>
                </td>
                <td className="px-6 py-5 align-middle text-ink-muted text-sm">{new Date(comment.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-5 align-middle text-right">
                  <div className="flex justify-end gap-3">
                    {!comment.approved ? (
                      <button type="button" className="text-xs font-semibold uppercase tracking-widest text-emerald-600 hover:text-emerald-800 transition-colors" onClick={() => approve.mutate(comment.id)}>
                        อนุมัติ (Approve)
                      </button>
                    ) : null}
                    {!comment.approved ? <span className="text-divider">|</span> : null}
                    <button type="button" className="text-xs font-semibold uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors" onClick={() => reject.mutate(comment.id)}>
                      ปฏิเสธ (Reject)
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {query.isLoading ? <p className="text-ink-muted text-sm mt-8 text-center uppercase tracking-widest">Loading...</p> : null}
      {comments.length === 0 && !query.isLoading ? <p className="text-ink-muted text-sm mt-8 text-center uppercase tracking-widest">No comments found.</p> : null}
    </div>
  );
}
