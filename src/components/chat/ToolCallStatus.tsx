import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolCallStatusProps {
  toolInvocation: ToolInvocation;
}

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

function getLabel(toolInvocation: ToolInvocation): string {
  const { toolName, args } = toolInvocation;
  const command = args?.command as string | undefined;
  const path = args?.path as string | undefined;
  const fileName = path ? getFileName(path) : "";

  if (toolName === "str_replace_editor" && command && fileName) {
    switch (command) {
      case "create":
        return `Creating ${fileName}`;
      case "str_replace":
      case "insert":
        return `Editing ${fileName}`;
      case "view":
        return `Viewing ${fileName}`;
    }
  }

  if (toolName === "file_manager" && command && fileName) {
    switch (command) {
      case "rename":
        return `Renaming ${fileName}`;
      case "delete":
        return `Deleting ${fileName}`;
    }
  }

  return toolName;
}

export function ToolCallStatus({ toolInvocation }: ToolCallStatusProps) {
  const label = getLabel(toolInvocation);
  const isComplete = toolInvocation.state === "result" && "result" in toolInvocation && toolInvocation.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" data-testid="status-complete"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" data-testid="status-loading" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
