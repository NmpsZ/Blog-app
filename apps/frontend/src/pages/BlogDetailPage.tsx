import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CommentForm from "../components/CommentForm";
import CommentList from "../components/CommentList";
import { api, errorMessage, imageUrl } from "../services/api";
import type { ApiResponse, Blog } from "../types";

export default function BlogDetailPage() {
  const { slug } = useParams();

  const query = useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Blog>>(`/api/blogs/${slug}`);
      return response.data.data;
    },
    enabled: Boolean(slug)
  });

  if (query.isLoading) return <p className="text-ink-muted text-sm text-center py-32 animate-pulse uppercase tracking-widest">Loading article...</p>;
  if (query.isError) return <p className="text-brand p-6 text-center py-32 max-w-3xl mx-auto">{errorMessage(query.error)}</p>;
  if (!query.data) return <p className="text-ink-muted text-center py-32 uppercase tracking-widest">Article not found.</p>;

  const blog = query.data;

  return (
    <article className="max-w-4xl mx-auto w-full relative px-6 sm:px-0 pt-10 pb-24">
      <Link to="/" className="inline-flex items-center gap-2 mb-12 text-ink-muted font-semibold uppercase tracking-widest text-xs hover:text-brand transition-colors">
        &larr; กลับไปหน้ารวมบทความ (Back to articles)
      </Link>

      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-6xl text-ink leading-[1.1] mb-6 max-w-3xl mx-auto">{blog.title}</h1>
      </header>

      <div className="mb-20 max-w-3xl mx-auto flex justify-center">
        <img className="w-full aspect-video sm:aspect-[16/9] object-cover object-center shadow-md border border-divider block mx-auto" src={imageUrl(blog.coverImage)} alt={blog.title} />
      </div>

      <div className="max-w-2xl mx-auto mb-24">
        <div className="whitespace-pre-wrap text-lg sm:text-xl leading-relaxed text-ink-muted font-sans mb-12">{blog.content}</div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t border-divider pt-8">
          <span className="inline-flex justify-center px-5 py-2.5 bg-paper border border-divider text-brand font-bold text-sm tracking-widest uppercase shadow-sm">
            วันที่โพสต์ {new Date(blog.createdAt).toLocaleDateString()}
          </span>
          <span className="inline-flex justify-center px-5 py-2.5 bg-paper border border-divider text-brand font-bold text-sm tracking-widest uppercase shadow-sm">
            {blog.viewCount} เข้าชม (views)
          </span>
        </div>
      </div>

      {blog.images.length > 0 ? (
        <section className="mb-24">
          <h2 className="text-2xl text-center mb-12">Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            {blog.images.map((image, index) => (
              <div key={`${image}-${index}`} className="overflow-hidden aspect-square group">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={imageUrl(image)} alt={blog.title} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="max-w-2xl mx-auto border-t border-divider pt-16">
        <CommentList comments={blog.comments ?? []} />
        <CommentForm blogId={blog.id} />
      </div>
    </article>
  );
}
