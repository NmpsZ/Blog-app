import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, errorMessage } from "../services/api";

const thaiNumberRegex = /^[ก-๙\s0-9]+$/u;

type Props = {
  blogId: number;
};

export default function CommentForm({ blogId }: Props) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/blogs/${blogId}/comments`, { name, message });
    },
    onSuccess: () => {
      setName("");
      setMessage("");
      setError("");
      setNotice("ส่ง comment แล้ว รอการอนุมัติจากแอดมิน");
    },
    onError: (err) => {
      setNotice("");
      setError(errorMessage(err));
    }
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!name.trim()) {
      setError("กรุณากรอกชื่อผู้ส่ง");
      return;
    }

    if (!thaiNumberRegex.test(message.trim())) {
      setError("ข้อความต้องเป็นภาษาไทยและ/หรือตัวเลขเท่านั้น");
      return;
    }

    mutation.mutate();
  }

  return (
    <form className="bg-surface border border-divider shadow-sm rounded-none p-8 sm:p-10 grid gap-8 mt-16" onSubmit={submit}>
      <h3 className="font-serif text-3xl text-ink tracking-tight mb-8">แสดงความคิดเห็น</h3>

      {notice ? <p className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 text-sm">{notice}</p> : null}
      {error ? <p className="bg-red-50 border border-red-200 text-brand p-6 text-sm">{error}</p> : null}

      <label className="grid gap-2 text-xs tracking-widest uppercase font-semibold text-ink-muted">
        <span>ชื่อ (Name) <span className="text-brand">*</span></span>
        <input
          className="w-full bg-surface border border-divider rounded-none text-ink px-4 py-3 focus:outline-none focus:border-brand transition-colors font-sans font-normal normal-case tracking-normal text-base"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <div className="grid gap-3 text-xs tracking-widest uppercase font-semibold text-ink-muted">
        <label htmlFor="messageInput">
          <span>ข้อความ (Message) <span className="text-brand">*</span></span>
        </label>
        <textarea
          id="messageInput"
          className="w-full bg-surface border border-divider rounded-none text-ink px-4 py-4 focus:outline-none focus:border-brand transition-colors placeholder:text-ink-muted font-sans font-normal normal-case tracking-normal text-base resize-y min-h-[120px]"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="แสดงความคิดเห็นของคุณ"
        />
        <p className="text-[10px] text-brand tracking-widest leading-relaxed">
          * ข้อความต้องเป็นภาษาไทยและ/หรือตัวเลขเท่านั้น (Thai language and numbers only)
        </p>
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 rounded-none font-medium text-surface bg-brand hover:bg-brand-hover transition-colors duration-200 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "กำลังส่ง... (Submitting...)" : "ส่งความคิดเห็น (Submit Comment)"}
      </button>
    </form>
  );
}
