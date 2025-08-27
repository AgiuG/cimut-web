import { cn } from "@/lib/utils";

interface CodeBlockProps {
  content: string;
  className?: string;
  title?: string;
}

export function CodeBlock({ content, className, title }: CodeBlockProps) {
  return (
    <div className={cn("relative rounded-lg border border-code-border bg-code-bg", className)}>
      {title && (
        <div className="flex items-center gap-2 border-b border-code-border px-4 py-2">
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-full bg-destructive/60"></div>
            <div className="h-3 w-3 rounded-full bg-warning/60"></div>
            <div className="h-3 w-3 rounded-full bg-success/60"></div>
          </div>
          <span className="text-sm text-muted-foreground font-mono">{title}</span>
        </div>
      )}
      <pre className="p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
        <code className="text-foreground">{content || "// No content to display"}</code>
      </pre>
    </div>
  );
}