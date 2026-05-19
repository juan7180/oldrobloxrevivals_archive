import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-reddit-blue hover:underline break-all"
    >
      {children}
    </a>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc pl-5 mb-2 space-y-0.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 mb-2 space-y-0.5">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-reddit-border pl-3 my-2 text-reddit-muted italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const inline = !className;
    if (inline) {
      return (
        <code className="bg-reddit-bg px-1 py-0.5 rounded text-[0.85em] font-mono">
          {children}
        </code>
      );
    }
    return (
      <code className="block bg-reddit-bg p-3 rounded text-xs font-mono overflow-x-auto my-2">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="my-2">{children}</pre>,
  h1: ({ children }) => (
    <h1 className="text-lg font-bold mb-2 mt-3">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>
  ),
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-3 border-reddit-border" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-xs border border-reddit-border">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-reddit-border px-2 py-1 bg-reddit-bg font-bold text-left">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-reddit-border px-2 py-1">{children}</td>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt ?? ""}
      className="max-w-full rounded my-2"
      loading="lazy"
    />
  ),
};

export function MarkdownBody({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  if (!text?.trim()) return null;

  return (
    <div className={`markdown-body leading-relaxed ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
