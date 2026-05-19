import { MarkdownBody } from "./MarkdownBody";

export function PostBody({
  text,
  className,
}: {
  text: string;
  highlightQuery?: string;
  className?: string;
}) {
  return <MarkdownBody text={text} className={className ?? "text-sm"} />;
}
