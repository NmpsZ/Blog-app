import type { Comment } from "../types";

type Props = {
  comments: Comment[];
};

export default function CommentList({ comments }: Props) {
  return (
    <section className="mt-16">
      <h3 className="font-serif text-3xl text-ink tracking-tight mb-8">ความคิดเห็น (Comments) <span className="text-brand">({comments.length})</span></h3>
      {comments.length === 0 ? (
        <p className="text-ink-muted italic">ยังไม่มีความคิดเห็น (No comments yet.)</p>
      ) : (
        <div className="grid gap-8">
          {comments.map((comment) => (
            <div className="bg-surface border border-divider shadow-sm rounded-none p-8" key={comment.id}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-ink rounded-none flex items-center justify-center text-surface font-serif font-bold text-xl">
                  {comment.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-ink text-lg font-serif">{comment.name}</p>
                  <p className="text-xs tracking-widest uppercase font-semibold text-ink-muted mt-1">{new Date(comment.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-ink leading-relaxed text-lg whitespace-pre-wrap font-sans">{comment.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
