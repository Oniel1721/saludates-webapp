import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ConversationFlow } from "@/lib/api";

const keys = {
  all: (clinicId: string) => ["conversations", clinicId] as const,
  list: (clinicId: string, flow?: ConversationFlow) =>
    ["conversations", clinicId, { flow }] as const,
  detail: (clinicId: string, id: string) => ["conversations", clinicId, id] as const,
};

export function useConversations(clinicId: string, flow?: ConversationFlow) {
  return useQuery({
    queryKey: keys.list(clinicId, flow),
    queryFn: () => api.conversations.list(clinicId, flow ? { flow } : undefined),
    enabled: !!clinicId,
  });
}

export function useConversation(clinicId: string, conversationId: string) {
  return useQuery({
    queryKey: keys.detail(clinicId, conversationId),
    queryFn: () => api.conversations.get(clinicId, conversationId),
    enabled: !!clinicId && !!conversationId,
  });
}

export function useResolveConversation(clinicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      api.conversations.resolve(clinicId, conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(clinicId) }),
  });
}
