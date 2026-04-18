/**
 * Frontend AI model registry.
 * Mirrors ownquesta_agents/lab_agent_server/models_config.py — single source of truth.
 *
 * Usage:
 *   const models = await fetchAvailableModels();   // from backend /v2/models
 *   const ok = canUseModel('claude-sonnet-4-5');   // checks localStorage quota
 *   recordModelUsage('claude-sonnet-4-5');          // increments quota counter
 */

export interface AIModel {
  id: string;
  display_name: string;
  short_name: string;
  provider: 'openai' | 'anthropic';
  free_quota: number | null;   // null = unlimited
}

// ── Quota helpers (localStorage) ─────────────────────────────────────────────

const QUOTA_KEY = 'ownquesta_model_usage';

function getUsageMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsageMap(map: Record<string, number>) {
  try {
    localStorage.setItem(QUOTA_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

/** How many sessions the user has used for this model. */
export function getModelUsageCount(modelId: string): number {
  return getUsageMap()[modelId] ?? 0;
}

/**
 * Returns true if the model can be used (unlimited quota OR quota not yet reached).
 * Pass the full AIModel object so we can read free_quota.
 */
export function canUseModel(model: AIModel): boolean {
  if (model.free_quota === null) return true;
  return getModelUsageCount(model.id) < model.free_quota;
}

/** Call this once when a new analysis session starts with the chosen model. */
export function recordModelUsage(modelId: string) {
  const map = getUsageMap();
  map[modelId] = (map[modelId] ?? 0) + 1;
  saveUsageMap(map);
}

// ── Backend fetch ─────────────────────────────────────────────────────────────

/**
 * Fetch the list of available models from the lab-agent backend.
 * Returns an empty array on error (graceful degradation).
 */
export async function fetchAvailableModels(agentUrl: string): Promise<AIModel[]> {
  try {
    const res = await fetch(`${agentUrl}/v2/models`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models ?? []) as AIModel[];
  } catch {
    return [];
  }
}

// ── Fallback static list (used when backend is offline) ──────────────────────

export const STATIC_MODELS: AIModel[] = [
  // ── Anthropic ─────────────────────────────────────────────────────────────
  { id: 'claude-sonnet-4-6', display_name: 'Claude Sonnet 4.6', short_name: 'Sonnet 4.6', provider: 'anthropic', free_quota: null },
  { id: 'claude-opus-4-6',   display_name: 'Claude Opus 4.6',   short_name: 'Opus 4.6',   provider: 'anthropic', free_quota: 1    },
  // ── OpenAI ────────────────────────────────────────────────────────────────
  { id: 'codex-5-2',         display_name: 'Codex 5.2',         short_name: 'Codex 5.2',  provider: 'openai',    free_quota: 1    },
  { id: 'gpt-5-3',           display_name: 'GPT 5.3',           short_name: 'GPT 5.3',    provider: 'openai',    free_quota: null },
  { id: 'gpt-4',             display_name: 'GPT-4',             short_name: 'GPT-4',      provider: 'openai',    free_quota: null },
  { id: 'gpt-4o-mini',      display_name: 'GPT-4o Mini',       short_name: 'GPT-4o Mini', provider: 'openai',   free_quota: null },
  { id: 'claude-haiku-4-5', display_name: 'Claude Haiku 4.5',  short_name: 'Haiku 4.5',  provider: 'anthropic', free_quota: 3    },
];
