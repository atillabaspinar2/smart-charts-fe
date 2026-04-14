export type AssistantProfile = {
  id: string;
  /** Optional user-friendly label shown in dropdowns. */
  label: string;
  geminiApiKey: string;
  geminiModel: string;
  createdAt: number;
  updatedAt: number;
};

const LS_PROFILES = "assistant:profiles:v1";
const LS_SELECTED_PROFILE_ID = "assistant:selectedProfileId:v1";

// Legacy single-profile keys (migrate once).
const LS_GEMINI_KEY_LEGACY = "assistant:geminiApiKey";
/** Also used for cached model list JSON (see below); migration reads only plain id strings. */
const LS_GEMINI_MODEL_LEGACY = "assistant:geminiModel";

/** Cached Gemini model list for Assistant settings dropdown (`JSON.stringify` array). */
export const LS_ASSISTANT_GEMINI_MODEL_LIST = LS_GEMINI_MODEL_LEGACY;

function now() {
  return Date.now();
}

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `profile_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  }
}

function safeParseProfiles(raw: string | null): AssistantProfile[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(Boolean)
      .map((p) => {
        const id = typeof p?.id === "string" ? p.id : newId();
        const label = typeof p?.label === "string" ? p.label : "Profile";
        const geminiApiKey = typeof p?.geminiApiKey === "string" ? p.geminiApiKey : "";
        const geminiModel = typeof p?.geminiModel === "string" ? p.geminiModel : "";
        const createdAt = typeof p?.createdAt === "number" ? p.createdAt : now();
        const updatedAt = typeof p?.updatedAt === "number" ? p.updatedAt : now();
        return { id, label, geminiApiKey, geminiModel, createdAt, updatedAt } satisfies AssistantProfile;
      })
      .filter((p) => p.geminiApiKey.trim() || p.geminiModel.trim());
  } catch {
    return [];
  }
}

/** When the key holds JSON (model list), do not treat it as a legacy single model id. */
function readLegacyGeminiModelIdForMigration(): string {
  const raw = localStorage.getItem(LS_GEMINI_MODEL_LEGACY) ?? "";
  const t = raw.trim();
  if (!t) return "";
  if (t.startsWith("[") || t.startsWith("{")) return "";
  return t;
}

export type AssistantProfilesState = {
  profiles: AssistantProfile[];
  selectedProfileId: string | null;
};

export function loadAssistantProfilesState(): AssistantProfilesState {
  try {
    const profiles = safeParseProfiles(localStorage.getItem(LS_PROFILES));
    const selectedProfileId = localStorage.getItem(LS_SELECTED_PROFILE_ID);
    const resolvedSelected =
      selectedProfileId && profiles.some((p) => p.id === selectedProfileId)
        ? selectedProfileId
        : profiles[0]?.id ?? null;

    // One-time legacy migration (only if there are no v1 profiles).
    if (profiles.length === 0) {
      const legacyKey = localStorage.getItem(LS_GEMINI_KEY_LEGACY) ?? "";
      const legacyModel = readLegacyGeminiModelIdForMigration();
      if (legacyKey.trim() || legacyModel.trim()) {
        const migrated: AssistantProfile = {
          id: newId(),
          label: "Default",
          geminiApiKey: legacyKey,
          geminiModel: legacyModel,
          createdAt: now(),
          updatedAt: now(),
        };
        const next = { profiles: [migrated], selectedProfileId: migrated.id };
        saveAssistantProfilesState(next);
        return next;
      }
    }

    return { profiles, selectedProfileId: resolvedSelected };
  } catch {
    return { profiles: [], selectedProfileId: null };
  }
}

export function saveAssistantProfilesState(next: AssistantProfilesState) {
  try {
    localStorage.setItem(LS_PROFILES, JSON.stringify(next.profiles));
    if (next.selectedProfileId) {
      localStorage.setItem(LS_SELECTED_PROFILE_ID, next.selectedProfileId);
    } else {
      localStorage.removeItem(LS_SELECTED_PROFILE_ID);
    }
  } catch {
    // ignore
  }
}

export function upsertAssistantProfile(
  state: AssistantProfilesState,
  profile: Omit<AssistantProfile, "createdAt" | "updatedAt"> & Partial<Pick<AssistantProfile, "createdAt" | "updatedAt">>,
): AssistantProfilesState {
  const existingIdx = state.profiles.findIndex((p) => p.id === profile.id);
  if (existingIdx === -1) {
    const createdAt = profile.createdAt ?? now();
    const nextProfile: AssistantProfile = {
      ...profile,
      label: profile.label?.trim() ? profile.label.trim() : "Profile",
      createdAt,
      updatedAt: profile.updatedAt ?? now(),
    };
    const next = {
      profiles: [nextProfile, ...state.profiles],
      selectedProfileId: state.selectedProfileId ?? nextProfile.id,
    };
    saveAssistantProfilesState(next);
    return next;
  }

  const prev = state.profiles[existingIdx];
  const updated: AssistantProfile = {
    ...prev,
    ...profile,
    label: profile.label?.trim() ? profile.label.trim() : prev.label,
    updatedAt: now(),
  };
  const nextProfiles = state.profiles.slice();
  nextProfiles[existingIdx] = updated;
  const next = { ...state, profiles: nextProfiles };
  saveAssistantProfilesState(next);
  return next;
}

export function deleteAssistantProfile(
  state: AssistantProfilesState,
  id: string,
): AssistantProfilesState {
  const nextProfiles = state.profiles.filter((p) => p.id !== id);
  const nextSelected =
    state.selectedProfileId === id ? nextProfiles[0]?.id ?? null : state.selectedProfileId;
  const next = { profiles: nextProfiles, selectedProfileId: nextSelected };
  saveAssistantProfilesState(next);
  return next;
}

export function setSelectedAssistantProfileId(
  state: AssistantProfilesState,
  id: string | null,
): AssistantProfilesState {
  const resolved =
    id && state.profiles.some((p) => p.id === id) ? id : state.profiles[0]?.id ?? null;
  const next = { ...state, selectedProfileId: resolved };
  saveAssistantProfilesState(next);
  return next;
}

export function createEmptyAssistantProfileDraft(): AssistantProfile {
  const t = now();
  return {
    id: newId(),
    label: "",
    geminiApiKey: "",
    geminiModel: "",
    createdAt: t,
    updatedAt: t,
  };
}

export type AssistantGeminiModelOption = {
  id: string;
  displayName: string;
};

/**
 * Model list for the Assistant settings `<select>` — stored at `assistant:geminiModel` as JSON.
 */
export function loadAssistantGeminiModelList(): AssistantGeminiModelOption[] {
  try {
    const raw = localStorage.getItem(LS_ASSISTANT_GEMINI_MODEL_LIST);
    if (!raw?.trim()) return [];
    const t = raw.trim();
    if (t.startsWith("[")) {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((m) => ({
          id: typeof m?.id === "string" ? m.id : "",
          displayName:
            typeof m?.displayName === "string" ? m.displayName : "",
        }))
        .filter((m) => m.id.length > 0)
        .map((m) => ({
          ...m,
          displayName: m.displayName.trim() || m.id,
        }));
    }
    if (t.startsWith("{")) {
      const parsed = JSON.parse(raw) as { models?: AssistantGeminiModelOption[] };
      const models = parsed?.models;
      if (!Array.isArray(models)) return [];
      return loadAssistantGeminiModelListFromArray(models);
    }
    return [];
  } catch {
    return [];
  }
}

function loadAssistantGeminiModelListFromArray(
  models: AssistantGeminiModelOption[],
): AssistantGeminiModelOption[] {
  return models
    .filter((m) => m && typeof m.id === "string" && m.id.trim().length > 0)
    .map((m) => ({
      id: m.id.trim(),
      displayName: (m.displayName ?? "").trim() || m.id.trim(),
    }));
}

export function saveAssistantGeminiModelList(
  models: Array<{ id: string; displayName: string }>,
): void {
  try {
    const normalized = models.map((m) => ({
      id: m.id.trim(),
      displayName: (m.displayName ?? "").trim() || m.id.trim(),
    }));
    localStorage.setItem(
      LS_ASSISTANT_GEMINI_MODEL_LIST,
      JSON.stringify(normalized),
    );
  } catch {
    // ignore
  }
}

