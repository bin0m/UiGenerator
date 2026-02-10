import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallStatus } from "../ToolCallStatus";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeToolInvocation(
  overrides: Partial<ToolInvocation> & { toolName: string; args: Record<string, unknown> },
  state: "call" | "result" = "result"
): ToolInvocation {
  const base = {
    toolCallId: "test-id",
    toolName: overrides.toolName,
    args: overrides.args,
  };
  if (state === "result") {
    return { ...base, state: "result", result: "Success" } as ToolInvocation;
  }
  return { ...base, state: "call" } as ToolInvocation;
}

test("renders 'Creating' for str_replace_editor create command", () => {
  const invocation = makeToolInvocation({
    toolName: "str_replace_editor",
    args: { command: "create", path: "/components/Card.jsx" },
  });
  render(<ToolCallStatus toolInvocation={invocation} />);
  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

test("renders 'Editing' for str_replace_editor str_replace command", () => {
  const invocation = makeToolInvocation({
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/components/Card.jsx" },
  });
  render(<ToolCallStatus toolInvocation={invocation} />);
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("renders 'Editing' for str_replace_editor insert command", () => {
  const invocation = makeToolInvocation({
    toolName: "str_replace_editor",
    args: { command: "insert", path: "/App.jsx" },
  });
  render(<ToolCallStatus toolInvocation={invocation} />);
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("renders 'Viewing' for str_replace_editor view command", () => {
  const invocation = makeToolInvocation({
    toolName: "str_replace_editor",
    args: { command: "view", path: "/App.jsx" },
  });
  render(<ToolCallStatus toolInvocation={invocation} />);
  expect(screen.getByText("Viewing App.jsx")).toBeDefined();
});

test("renders 'Deleting' for file_manager delete command", () => {
  const invocation = makeToolInvocation({
    toolName: "file_manager",
    args: { command: "delete", path: "/old-file.tsx" },
  });
  render(<ToolCallStatus toolInvocation={invocation} />);
  expect(screen.getByText("Deleting old-file.tsx")).toBeDefined();
});

test("renders 'Renaming' for file_manager rename command", () => {
  const invocation = makeToolInvocation({
    toolName: "file_manager",
    args: { command: "rename", path: "/Button.tsx", new_path: "/PrimaryButton.tsx" },
  });
  render(<ToolCallStatus toolInvocation={invocation} />);
  expect(screen.getByText("Renaming Button.tsx")).toBeDefined();
});

test("shows spinner when tool is in progress", () => {
  const invocation = makeToolInvocation(
    { toolName: "str_replace_editor", args: { command: "create", path: "/App.jsx" } },
    "call"
  );
  render(<ToolCallStatus toolInvocation={invocation} />);
  expect(screen.getByTestId("status-loading")).toBeDefined();
});

test("shows green dot when tool is complete", () => {
  const invocation = makeToolInvocation({
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
  });
  render(<ToolCallStatus toolInvocation={invocation} />);
  expect(screen.getByTestId("status-complete")).toBeDefined();
});

test("falls back to tool name for unknown tools", () => {
  const invocation = makeToolInvocation({
    toolName: "unknown_tool",
    args: {},
  });
  render(<ToolCallStatus toolInvocation={invocation} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("extracts filename from nested path", () => {
  const invocation = makeToolInvocation({
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/components/ui/Button.tsx" },
  });
  render(<ToolCallStatus toolInvocation={invocation} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});
