import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeContext";
import { useRouter } from "next/router";
import { PopulatedConversation } from "@/components/chat/ConversationList";

export function useCommunication() {
  const { user, loadingUser } = useAuth();
  const { theme } = useTheme();
  const [conversations, setConversations] = useState<PopulatedConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<PopulatedConversation | null>(null);
  const [showNewDirectChatModal, setShowNewDirectChatModal] = useState(false);
  const [showNewGroupChatModal, setShowNewGroupChatModal] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setLoadingConversations(false);
      return;
    }
    const fetchConversations = async () => {
      setLoadingConversations(true);
      setError(null);
      try {
        const res = await fetch(`/api/conversations?userId=${user._id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch conversations");
        }
        const data = await res.json();
        setConversations(data.conversations as PopulatedConversation[]);
      } catch (err: any) {
        setError("Could not load conversations.");
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (router.query.userId && conversations.length > 0) {
      const convo = conversations.find((c) =>
        c.participants.some((p) => p._id === router.query.userId)
      );
      if (convo) setSelectedConversation(convo);
    }
  }, [router.query.userId, conversations]);

  const handleChatCreated = useCallback(
    (newConversationId: string) => {
      if (user) {
        fetch(`/api/conversations?userId=${user._id}`)
          .then((res) => res.json())
          .then((data) => {
            setConversations(data.conversations as PopulatedConversation[]);
            const newConvo = data.conversations.find(
              (c: PopulatedConversation) =>
                (c._id as string) === newConversationId
            );
            if (newConvo) {
              setSelectedConversation(newConvo);
            }
          })
          .catch(() => {});
      }
    },
    [user]
  );

  const selectedConversationId = selectedConversation?._id?.toString() || null;

  return {
    user,
    loadingUser,
    theme,
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    showNewDirectChatModal,
    setShowNewDirectChatModal,
    showNewGroupChatModal,
    setShowNewGroupChatModal,
    loadingConversations,
    setLoadingConversations,
    error,
    setError,
    router,
    handleChatCreated,
    selectedConversationId,
  };
}
