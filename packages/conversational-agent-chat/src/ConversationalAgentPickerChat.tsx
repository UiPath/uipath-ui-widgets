import { Alert, AlertDescription, Button, Search } from "@uipath/apollo-wind";
import { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AgentList } from "./components/AgentList";
import { agentKey } from "./components/agentUtils";
import { useFavorites } from "./components/useFavorites";
import { ConversationalAgentChat } from "./ConversationalAgentChat";
import "./ConversationalAgentChat.css";
import {
  AgentSummary,
  ConversationalAgentPickerChatProps,
  TelemetryEvent,
  TelemetryStatus,
} from "./types";
import { trackTelemetry } from "./utils/telemetryUtils";

const DEFAULT_PICKER_TITLE = "UiPath Agent Chat";
const DEFAULT_PICKER_SUBTITLE = "Select an agent to start a conversation.";
const DEFAULT_BACK = "Back";
const DEFAULT_SEARCH_PLACEHOLDER = "Search agents...";
const DEFAULT_FAVORITES = "Favorites";
const DEFAULT_ALL_AGENTS = "All Agents";
const DEFAULT_AGENTS = "Agents";
const DEFAULT_NO_AGENTS = "No agents available.";
const DEFAULT_NO_SEARCH_RESULTS = "No agents match your search.";
const DEFAULT_LOADING = "Loading agents...";
const DEFAULT_RELOAD = "Reload";

const SectionHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h3
    className={`mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${className}`}
  >
    {children}
  </h3>
);

const CenteredState = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center gap-4 flex-1 p-6">
    {children}
  </div>
);

export const ConversationalAgentPickerChat = ({
  sdk,
  locale = "en",
  theme = "light",
  readOnly = false,
  overrideLabels,
  onAgentSelected,
  onUserMessageSent,
  surfaceName,
  surfaceVersion,
}: ConversationalAgentPickerChatProps) => {
  const [agents, setAgents] = useState<AgentSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentSummary | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { favorites, toggle: toggleFavoriteKey } = useFavorites(sdk);

  useEffect(() => {
    let cancelled = false;

    const fetchAgents = async () => {
      try {
        const agentService = new ConversationalAgent(sdk);
        const result = await agentService.getAll();
        if (cancelled) return;
        const summaries: AgentSummary[] = result.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          folderId: a.folderId,
        }));
        setAgents(summaries);
        setError(null);
        trackTelemetry(TelemetryEvent.LoadAgents, TelemetryStatus.Success, {
          agentCount: summaries.length,
        });
      } catch (err) {
        if (cancelled) return;
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load agents";
        setError(errorMessage);
        trackTelemetry(TelemetryEvent.LoadAgents, TelemetryStatus.Error, {
          error: errorMessage,
        });
      }
    };

    fetchAgents();
    return () => {
      cancelled = true;
    };
  }, [sdk, reloadKey]);

  const handleSelect = useCallback(
    (agent: AgentSummary) => {
      setSelectedAgent(agent);
      onAgentSelected?.(agent);
      trackTelemetry(TelemetryEvent.SelectAgent, TelemetryStatus.Success, {
        agentId: agent.id,
        folderId: agent.folderId,
      });
    },
    [onAgentSelected],
  );

  const handleBack = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  const handleReload = useCallback(() => {
    setError(null);
    setAgents(null);
    setReloadKey((k) => k + 1);
  }, []);

  const handleToggleFavorite = useCallback(
    (agent: AgentSummary) => toggleFavoriteKey(agentKey(agent)),
    [toggleFavoriteKey],
  );

  const { favoriteAgents, otherAgents } = useMemo(() => {
    if (!agents) return { favoriteAgents: [], otherAgents: [] };
    const q = searchQuery.trim().toLowerCase();
    const matches = (agent: AgentSummary) => {
      if (!q) return true;
      return (
        agent.name.toLowerCase().includes(q) ||
        (agent.description?.toLowerCase().includes(q) ?? false)
      );
    };
    const filtered = agents.filter(matches);
    const favs: AgentSummary[] = [];
    const rest: AgentSummary[] = [];
    for (const agent of filtered) {
      if (favorites.has(agentKey(agent))) favs.push(agent);
      else rest.push(agent);
    }
    return { favoriteAgents: favs, otherAgents: rest };
  }, [agents, favorites, searchQuery]);

  if (selectedAgent) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border-de-emp">
          <Button variant="outline" onClick={handleBack}>
            {DEFAULT_BACK}
          </Button>
          <span className="font-medium truncate">{selectedAgent.name}</span>
        </div>
        <div className="flex-1 min-h-0 p-2">
          <ConversationalAgentChat
            key={agentKey(selectedAgent)}
            sdk={sdk}
            agentId={selectedAgent.id}
            folderId={selectedAgent.folderId}
            locale={locale}
            theme={theme}
            readOnly={readOnly}
            overrideLabels={overrideLabels}
            onUserMessageSent={onUserMessageSent}
            surfaceName={surfaceName}
            surfaceVersion={surfaceVersion}
          />
        </div>
      </div>
    );
  }

  const hasFilteredResults =
    favoriteAgents.length > 0 || otherAgents.length > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 pt-8 pb-4 text-center">
        <h2 className="text-2xl font-semibold">{DEFAULT_PICKER_TITLE}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {DEFAULT_PICKER_SUBTITLE}
        </p>
      </div>

      <div className="px-8 pb-4 max-w-2xl w-full mx-auto">
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={DEFAULT_SEARCH_PLACEHOLDER}
          aria-label={DEFAULT_SEARCH_PLACEHOLDER}
        />
      </div>

      {error && (
        <CenteredState>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={handleReload}>
            {DEFAULT_RELOAD}
          </Button>
        </CenteredState>
      )}

      {!error && agents === null && (
        <CenteredState>
          <Alert>
            <AlertDescription>{DEFAULT_LOADING}</AlertDescription>
          </Alert>
        </CenteredState>
      )}

      {!error && agents !== null && (
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {!hasFilteredResults && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              {searchQuery ? DEFAULT_NO_SEARCH_RESULTS : DEFAULT_NO_AGENTS}
            </div>
          )}

          {favoriteAgents.length > 0 && (
            <>
              <SectionHeader className="mt-4">
                {DEFAULT_FAVORITES}
              </SectionHeader>
              <AgentList
                agents={favoriteAgents}
                onSelect={handleSelect}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            </>
          )}

          {otherAgents.length > 0 && (
            <>
              <SectionHeader
                className={favoriteAgents.length > 0 ? "mt-8" : "mt-4"}
              >
                {favoriteAgents.length > 0
                  ? DEFAULT_ALL_AGENTS
                  : DEFAULT_AGENTS}
              </SectionHeader>
              <AgentList
                agents={otherAgents}
                onSelect={handleSelect}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
