export interface AIModel {
  id: string;
  display_name: string;
  short_name: string;
  provider: 'openai' | 'anthropic';
  free_quota: number | null;
}

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
  } catch {}
}

export function getModelUsageCount(modelId: string): number {
  return getUsageMap()[modelId] ?? 0;
}

export function canUseModel(model: AIModel): boolean {
  if (model.free_quota === null) return true;
  return getModelUsageCount(model.id) < model.free_quota;
}

export function recordModelUsage(modelId: string) {
  const map = getUsageMap();
  map[modelId] = (map[modelId] ?? 0) + 1;
  saveUsageMap(map);
}

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

export const STATIC_MODELS: AIModel[] = [
  // ── Anthropic ─────────────────────────────────────────────────────────────
  { id: 'claude-sonnet', display_name: 'Claude Sonnet', short_name: 'Sonnet', provider: 'anthropic', free_quota: 0 },
  { id: 'claude-opus',   display_name: 'Claude Opus',   short_name: 'Opus',   provider: 'anthropic', free_quota: 0 },
  { id: 'claude-haiku',  display_name: 'Claude Haiku',  short_name: 'Haiku',  provider: 'anthropic', free_quota: 0 },
  // ── OpenAI ────────────────────────────────────────────────────────────────
  { id: 'codex-5-2',   display_name: 'Codex 5.2',   short_name: 'Codex 5.2',   provider: 'openai', free_quota: 0    },
  { id: 'gpt-5-3',     display_name: 'GPT 5.3',     short_name: 'GPT 5.3',     provider: 'openai', free_quota: null },
  { id: 'gpt-4o-mini',  display_name: 'GPT-4o Mini',  short_name: 'GPT-4o Mini',  provider: 'openai', free_quota: null },
  { id: 'gpt-4.1-mini', display_name: 'GPT-4.1 Mini', short_name: 'GPT-4.1 Mini', provider: 'openai', free_quota: null },
];

