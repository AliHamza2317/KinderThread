import Markdown from "react-markdown";

/** Safe markdown (no raw HTML) for CMS content. */
export function Prose({ children }: { children: string }) {
  return (
    <div className="prose-kt">
      <Markdown>{children}</Markdown>
    </div>
  );
}
