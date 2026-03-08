import { apiClient } from '../client';
import type { Conversation, ConversationDetail, ConversationFlow } from '../types';

const base = (clinicId: string) => `/clinics/${clinicId}/conversations`;

export const conversations = {
  /**
   * List conversations.
   * Pass flow='ESCALATED' to show only escalated ones (bot inbox).
   */
  list(clinicId: string, params?: { flow?: ConversationFlow }) {
    return apiClient
      .get<Conversation[]>(base(clinicId), { params })
      .then((r) => r.data);
  },

  /** Get a conversation with full message history. */
  get(clinicId: string, conversationId: string) {
    return apiClient
      .get<ConversationDetail>(`${base(clinicId)}/${conversationId}`)
      .then((r) => r.data);
  },

  /**
   * Resolve an escalated conversation.
   * Sets flow back to OUT_OF_FLOW so the bot resumes handling it.
   */
  resolve(clinicId: string, conversationId: string) {
    return apiClient
      .post<Conversation>(`${base(clinicId)}/${conversationId}/resolve`)
      .then((r) => r.data);
  },
};
