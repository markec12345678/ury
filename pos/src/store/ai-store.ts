import { create } from 'zustand';
import {
  askAboutReport,
  generateInsight,
  isAIEnabled,
  type AIMessage,
  type AIChatResponse,
} from '../lib/ai-service';
import { t } from '../i18n';

// ---- Types ----

export interface AIConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AIState {
  enabled: boolean;
  panelOpen: boolean;
  loading: boolean;
  error: string | null;
  messages: AIConversationMessage[];
  currentReportType: string;
  currentReportData: Record<string, unknown>;
  currency: string;
  lastModel: string | null;
  totalTokensUsed: number;
  /** R38-FIX: Counter moved from module-level global into store state to avoid
   *  duplicate IDs on hot-module reload and to reset on clearConversation. */
  _messageCounter: number;
}

export interface AIActions {
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  setReportContext: (reportType: string, reportData: Record<string, unknown>, currency?: string) => void;
  sendMessage: (content: string) => Promise<void>;
  generateQuickInsight: () => Promise<void>;
  clearConversation: () => void;
  refreshEnabled: () => void;
}

export type AIStore = AIState & AIActions;

// ---- Helpers ----

// R38-FIX: messageCounter moved into store state (_messageCounter) to:
// 1) Reset on clearConversation, 2) Avoid duplicate IDs on HMR, 3) Be testable
function createMessage(counter: number, role: 'user' | 'assistant', content: string): AIConversationMessage {
  return {
    id: `ai-msg-${counter}-${Date.now()}`,
    role,
    content,
    timestamp: Date.now(),
  };
}

function buildHistory(messages: AIConversationMessage[]): AIMessage[] {
  // Only send last 10 messages to keep context window manageable
  const recent = messages.slice(-10);
  return recent.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

// ---- Store ----

export const useAIStore = create<AIStore>()((set, get) => ({
  enabled: isAIEnabled(),
  panelOpen: false,
  loading: false,
  error: null,
  messages: [],
  currentReportType: 'sales',
  currentReportData: {},
  currency: 'EUR',
  lastModel: null,
  totalTokensUsed: 0,
  _messageCounter: 0,

  togglePanel: () => {
    const isOpen = get().panelOpen;
    set({ panelOpen: !isOpen });
  },

  openPanel: () => set({ panelOpen: true }),

  closePanel: () => set({ panelOpen: false }),

  setReportContext: (reportType, reportData, currency = 'EUR') => {
    set({
      currentReportType: reportType,
      currentReportData: reportData,
      currency,
    });
  },

  sendMessage: async (content) => {
    const state = get();
    if (state.loading) return;

    const nextCounter = state._messageCounter + 1;
    const userMsg = createMessage(nextCounter, 'user', content);
    set({ loading: true, error: null, messages: [...state.messages, userMsg], _messageCounter: nextCounter });

    try {
      const history = buildHistory(state.messages);
      const response = await askAboutReport(
        content,
        state.currentReportType,
        state.currentReportData,
        history,
        state.currency
      );

      const assistCounter = get()._messageCounter + 1;
      const assistantMsg = createMessage(assistCounter, 'assistant', response.content);
      set((s) => ({
        messages: [...s.messages, assistantMsg],
        lastModel: response.model,
        totalTokensUsed: s.totalTokensUsed + (response.usage?.total_tokens || 0),
        loading: false,
        _messageCounter: assistCounter,
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('ai.errors.request_failed');
      set({ error: errorMsg, loading: false });

      // Add error as assistant message for visibility
      const errCounter = get()._messageCounter + 1;
      const errorMsg2 = createMessage(errCounter, 'assistant', `⚠️ ${errorMsg}`);
      set((s) => ({ messages: [...s.messages, errorMsg2], _messageCounter: errCounter }));
    }
  },

  generateQuickInsight: async () => {
    const state = get();
    if (state.loading) return;

    set({ loading: true, error: null });

    try {
      const response = await generateInsight(
        state.currentReportType,
        state.currentReportData,
        state.currency
      );

      const insightCounter = get()._messageCounter + 1;
      const insightMsg = createMessage(insightCounter, 'assistant', response.content);
      set((s) => ({
        messages: [...s.messages, insightMsg],
        lastModel: response.model,
        totalTokensUsed: s.totalTokensUsed + (response.usage?.total_tokens || 0),
        loading: false,
        _messageCounter: insightCounter,
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('ai.errors.generate_failed');
      set({ error: errorMsg, loading: false });

      const errCounter = get()._messageCounter + 1;
      const errorMsg2 = createMessage(errCounter, 'assistant', `⚠️ ${errorMsg}`);
      set((s) => ({ messages: [...s.messages, errorMsg2], _messageCounter: errCounter }));
    }
  },

  clearConversation: () => {
    set({ messages: [], error: null, _messageCounter: 0 });
  },

  refreshEnabled: () => {
    set({ enabled: isAIEnabled() });
  },
}));
