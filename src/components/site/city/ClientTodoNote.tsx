import type { ClientTodo } from "@/lib/site/cityPages";

type ClientTodoNoteProps = {
  todo: ClientTodo;
  /** Only logged-in admins see placeholders; public visitors get nothing. */
  show: boolean;
  className?: string;
};

/** Dashed "content still needed" note — admin preview only. */
export function ClientTodoNote({ todo, show, className = "" }: ClientTodoNoteProps) {
  if (!show) {
    return null;
  }

  return (
    <p className={`draft-note ${className}`} data-client-todo>
      <strong>[CLIENT TO PROVIDE]</strong> {todo.todo}{" "}
      <span className="opacity-70">· Visible to admins only</span>
    </p>
  );
}
