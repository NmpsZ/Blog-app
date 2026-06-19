import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Pagination from "../components/Pagination";
import { api, errorMessage, imageUrl } from "../services/api";
import type { PaginatedBlogs } from "../types";

export default function BlogListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const query = useQuery({
    queryKey: ["blogs", page, debouncedSearch],
    queryFn: async () => {
      const response = await api.get<PaginatedBlogs>("/api/blogs", {
        params: { page, search: debouncedSearch }
      });
      return response.data;
    }
  });

  return (
    <div className="max-w-5xl mx-auto w-full relative">
      <header className="flex flex-col items-center justify-center gap-6 mb-24 pt-12 text-center">
        <h1 className="font-serif text-5xl sm:text-7xl text-ink tracking-tight leading-[1.1]">
          Welcome to<br /><span className="italic text-brand">Blog App</span>
        </h1>
        <p className="text-ink-muted text-lg max-w-lg mb-4 mt-4 font-sans leading-relaxed">
          Discover the latest articles, stories, and insights.
        </p>
        <div className="w-full max-w-md relative mt-8">
          <input
            className="w-full bg-surface border border-divider rounded-none text-ink px-6 py-4 focus:outline-none focus:border-brand transition-colors placeholder:text-ink-muted placeholder:uppercase placeholder:tracking-widest placeholder:text-xs"
            placeholder="ค้นหาบทความ... (Search articles...)"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </header>

      {query.isLoading ? <p className="text-ink-muted text-sm text-center mb-8 uppercase tracking-widest">Loading stories...</p> : null}
      {query.isError ? <p className="bg-red-50 border border-red-200 text-brand p-6 text-center mb-8">{errorMessage(query.error)}</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-20">
        {query.data?.data.map((blog) => (
          <article className="group flex flex-col" key={blog.id}>
            <div className="w-full overflow-hidden aspect-[4/3] mb-6 border border-divider shadow-sm">
              <Link to={`/blog/${blog.slug}`}>
                <img src={imageUrl(blog.coverImage)} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              </Link>
            </div>
            <div className="w-full flex flex-col flex-grow">
              <h2 className="font-serif text-2xl text-ink leading-snug mb-3 group-hover:text-brand transition-colors duration-300">
                <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
              </h2>
              <p className="text-ink-muted text-base leading-relaxed line-clamp-2 mb-6 flex-grow">{blog.excerpt}</p>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="px-2 py-1 bg-paper border border-divider text-brand font-bold text-[10px] tracking-widest uppercase shadow-sm">
                  วันที่โพสต์ {new Date(blog.createdAt).toLocaleDateString()}
                </span>
                <span className="px-2 py-1 bg-paper border border-divider text-brand font-bold text-[10px] tracking-widest uppercase shadow-sm">
                  {blog.viewCount} เข้าชม
                </span>
              </div>
              <Link to={`/blog/${blog.slug}`} className="px-4 py-2 bg-ink text-surface hover:bg-brand transition-colors duration-300 text-[10px] font-bold uppercase tracking-[0.2em] self-start inline-flex items-center gap-2 shadow-sm">
                รายละเอียด <span>&rarr;</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {query.data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-divider text-center gap-4">
          <p className="text-ink-muted text-lg">ไม่พบบทความที่ค้นหา (No articles found matching your search.)</p>
          <Link to="/admin/blogs/new" className="inline-flex items-center justify-center px-8 py-3 rounded-none font-medium text-surface bg-brand hover:bg-brand-hover transition-colors duration-200 uppercase tracking-widest text-xs mt-2">
            + สร้างบทความ (Create Blog)
          </Link>
        </div>
      ) : null}
      {query.data ? (
        <Pagination page={query.data.meta.page} totalPages={query.data.meta.totalPages} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
