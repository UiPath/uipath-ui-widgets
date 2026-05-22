import { AgentSummary } from "../types";

const AVATAR_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#db2777",
  "#0d9488",
  "#475569",
];

export function agentKey(agent: AgentSummary): string {
  return `${agent.folderId}-${agent.id}`;
}

export function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
