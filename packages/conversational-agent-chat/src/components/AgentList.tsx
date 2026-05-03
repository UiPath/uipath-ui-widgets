import {
  Avatar,
  AvatarFallback,
  Card,
  CardDescription,
} from "@uipath/apollo-wind";
import { AgentSummary } from "../types";
import { agentKey, colorForName } from "./agentUtils";

const DEFAULT_NO_DESCRIPTION = "No description available";
const DEFAULT_ADD_TO_FAVORITES = "Add to favorites";
const DEFAULT_REMOVE_FROM_FAVORITES = "Remove from favorites";

interface AgentListProps {
  agents: AgentSummary[];
  onSelect: (agent: AgentSummary) => void;
  favorites: Set<string>;
  onToggleFavorite: (agent: AgentSummary) => void;
}

interface AgentCardProps {
  agent: AgentSummary;
  isFavorite: boolean;
  onSelect: (agent: AgentSummary) => void;
  onToggleFavorite: (agent: AgentSummary) => void;
}

const AgentCard = ({
  agent,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: AgentCardProps) => {
  const initial = agent.name.charAt(0).toUpperCase() || "?";
  const color = colorForName(agent.name);

  return (
    <Card className="relative transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring">
      <button
        type="button"
        onClick={() => onSelect(agent)}
        className="flex items-start gap-3 p-4 w-full text-left cursor-pointer rounded-[inherit] focus:outline-none"
      >
        <Avatar className="h-12 w-12 rounded-md">
          <AvatarFallback
            className="rounded-md text-white font-semibold text-base"
            style={{ backgroundColor: color }}
          >
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 pr-6">
          <div className="font-semibold truncate">{agent.name}</div>
          <CardDescription className="line-clamp-2 mt-1">
            {agent.description || DEFAULT_NO_DESCRIPTION}
          </CardDescription>
        </div>
      </button>
      <button
        type="button"
        className={`absolute top-3 right-3 text-lg leading-none rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isFavorite
            ? "text-amber-500"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => onToggleFavorite(agent)}
        aria-label={
          isFavorite ? DEFAULT_REMOVE_FROM_FAVORITES : DEFAULT_ADD_TO_FAVORITES
        }
      >
        {isFavorite ? "★" : "☆"}
      </button>
    </Card>
  );
};

export const AgentList = ({
  agents,
  onSelect,
  favorites,
  onToggleFavorite,
}: AgentListProps) => {
  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
      {agents.map((agent) => {
        const key = agentKey(agent);
        return (
          <AgentCard
            key={key}
            agent={agent}
            isFavorite={favorites.has(key)}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
          />
        );
      })}
    </div>
  );
};
