import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, errorMessage, imageUrl } from "../../services/api";
import type { ApiResponse, Blog } from "../../types";

export default function BlogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const query = useQuery({
    queryKey: ["admin-blog", id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Blog>>(`/api/admin/blogs/${id}`);
      return response.data.data;
    },
    enabled: isEdit
  });

  useEffect(() => {
    if (!query.data) return;
    setTitle(query.data.title);
    setSlug(query.data.slug);
    setExcerpt(query.data.excerpt);
    setContent(query.data.content);
    setPublished(query.data.published);
    setCoverImage(query.data.coverImage);
    setExistingImages(query.data.images);
  }, [query.data]);

  const save = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("excerpt", excerpt);
      formData.append("content", content);
      formData.append("published", String(published));
      formData.append("existingImages", JSON.stringify(existingImages));
      if (coverImage) formData.append("coverImage", coverImage);
      if (coverFile) formData.append("coverImage", coverFile);
      imageFiles.forEach((file) => formData.append("images", file));

      if (isEdit) {
        await api.put(`/api/admin/blogs/${id}`, formData);
      } else {
        await api.post("/api/admin/blogs", formData);
      }
    },
    onSuccess: () => navigate("/admin/blogs")
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  function onExtraFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    const selected = Array.from(files);
    const maxAllowed = Math.max(0, 6 - existingImages.length);
    
    if (selected.length > maxAllowed) {
      const allowedFiles = selected.slice(0, maxAllowed);
      
      // Create a new DataTransfer object to update the native input's file list
      const dataTransfer = new DataTransfer();
      allowedFiles.forEach(file => dataTransfer.items.add(file));
      
      // Update the input element so the browser UI says "6 files" instead of "11 files"
      event.target.files = dataTransfer.files;
      setImageFiles(allowedFiles);
    } else {
      setImageFiles(selected);
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <Link to="/admin/blogs" className="inline-flex items-center gap-2 mb-8 text-ink-muted font-semibold uppercase tracking-widest text-xs hover:text-brand transition-colors">
        &larr; กลับไปหน้ารวมบทความ (Back to articles)
      </Link>
      <form className="bg-surface border border-divider shadow-sm grid p-8 sm:p-12 gap-8" onSubmit={submit}>
        <h1 className="text-4xl font-serif text-ink mb-4">{isEdit ? "แก้ไขบทความ (Edit Article)" : "สร้างบทความใหม่ (New Article)"}</h1>
        {save.isError ? <p className="bg-red-50 border border-red-200 text-brand p-4 text-sm">{errorMessage(save.error)}</p> : null}
        {query.isError ? <p className="bg-red-50 border border-red-200 text-brand p-4 text-sm">{errorMessage(query.error)}</p> : null}
        
        <label className="grid gap-3 text-xs tracking-widest uppercase font-semibold text-ink-muted">
          หัวข้อ (Title)
          <input className="w-full bg-surface border border-divider rounded-none text-ink px-4 py-3 focus:outline-none focus:border-brand transition-colors font-sans font-normal normal-case tracking-normal text-base" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label className="grid gap-3 text-xs tracking-widest uppercase font-semibold text-ink-muted">
          สลัก (Slug)
          <input className="w-full bg-surface border border-divider rounded-none text-ink px-4 py-3 focus:outline-none focus:border-brand transition-colors font-sans font-normal normal-case tracking-normal text-base" value={slug} onChange={(event) => setSlug(event.target.value)} required />
        </label>
        <label className="grid gap-3 text-xs tracking-widest uppercase font-semibold text-ink-muted">
          เนื้อหาอย่างย่อ (Excerpt)
          <textarea className="w-full bg-surface border border-divider rounded-none text-ink px-4 py-3 focus:outline-none focus:border-brand transition-colors font-sans font-normal normal-case tracking-normal text-base resize-y" rows={3} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} required />
        </label>
        <label className="grid gap-3 text-xs tracking-widest uppercase font-semibold text-ink-muted">
          เนื้อหา (Content)
          <textarea className="w-full bg-surface border border-divider rounded-none text-ink px-4 py-3 focus:outline-none focus:border-brand transition-colors font-sans font-normal normal-case tracking-normal text-base resize-y font-mono text-sm leading-relaxed" rows={15} value={content} onChange={(event) => setContent(event.target.value)} required />
        </label>
        
        <div className="grid gap-8 sm:grid-cols-2 mt-4">
          <div>
            <label className="grid gap-3 text-xs tracking-widest uppercase font-semibold text-ink-muted mb-4">
              รูปปก (Cover image)
              <input type="file" className="block w-full text-sm text-ink-muted file:mr-4 file:py-2 file:px-4 file:border file:border-divider file:text-xs file:uppercase file:tracking-widest file:font-semibold file:bg-paper file:text-ink hover:file:bg-divider transition-colors cursor-pointer" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)} />
            </label>
            {coverFile ? <img className="w-full aspect-video object-cover border border-divider mt-2" src={URL.createObjectURL(coverFile)} alt="Cover preview" /> : null}
            {!coverFile && coverImage ? <img className="w-full aspect-video object-cover border border-divider mt-2" src={imageUrl(coverImage)} alt="Current cover" /> : null}
          </div>
          <div>
            <label className="grid gap-3 text-xs tracking-widest uppercase font-semibold text-ink-muted mb-4">
              รูปเพิ่มเติม สูงสุด 6 รูป (Extra images Max 6)
              <input type="file" className="block w-full text-sm text-ink-muted file:mr-4 file:py-2 file:px-4 file:border file:border-divider file:text-xs file:uppercase file:tracking-widest file:font-semibold file:bg-paper file:text-ink hover:file:bg-divider transition-colors cursor-pointer" accept="image/*" multiple onChange={onExtraFiles} />
            </label>
            {existingImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {existingImages.map((image, index) => (
                  <div key={`${image}-${index}`} className="flex flex-col gap-2">
                    <img src={imageUrl(image)} className="w-full aspect-square object-cover border border-divider" alt="Existing upload" />
                    <button type="button" className="px-3 py-2 bg-transparent border border-divider text-red-600 text-xs tracking-widest uppercase font-semibold hover:bg-red-50 hover:border-red-200 transition-colors w-full" onClick={() => setExistingImages((items) => items.filter((_, i) => i !== index))}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            {imageFiles.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {imageFiles.map((file) => (
                  <div key={file.name} className="relative aspect-square border border-divider overflow-hidden">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt={file.name} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer mt-4 py-4 border-t border-b border-divider">
          <input type="checkbox" className="w-5 h-5 rounded-none border-divider text-brand focus:ring-brand cursor-pointer" checked={published} onChange={(event) => setPublished(event.target.checked)} />
          <span className="font-semibold text-ink text-sm tracking-widest uppercase">เผยแพร่ทันที (Publish immediately)</span>
        </label>

        <div className="flex justify-end pt-4">
          <button type="submit" className="inline-flex items-center justify-center px-10 py-4 rounded-none font-medium text-surface bg-brand hover:bg-brand-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs" disabled={save.isPending}>
            {save.isPending ? "กำลังบันทึก... (Saving...)" : "บันทึกบทความ (Save Article)"}
          </button>
        </div>
      </form>
    </div>
  );
}
