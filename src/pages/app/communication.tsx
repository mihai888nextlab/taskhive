import React, { useEffect, useState, useCallback } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import ConversationList, {
  PopulatedConversation,
} from "@/components/chat/ConversationList";
import Loading from "@/components/Loading";
import NewDirectChatModal from "@/components/chat/NewDirectChatModel";
import NewGroupChatModal from "@/components/chat/NewGroupChatModal";
import { useRouter } from "next/router";
import { useTheme } from "@/components/ThemeContext";

const Communication: NextPageWithLayout = () => {
  const { user, loadingUser } = useAuth();
  const { theme } = useTheme();
  const [conversations, setConversations] = useState<PopulatedConversation[]>(
    []
  );
  const [selectedConversation, setSelectedConversation] =
    useState<PopulatedConversation | null>(null);
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
        console.error("Error fetching conversations:", err);
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
          .catch((err) =>
            console.error(
              "Failed to re-fetch conversations after creation",
              err
            )
          );
      }
    },
    [user]
  );

  const selectedConversationId = selectedConversation?._id?.toString() || null;

  return (
    <div
      className={`relative ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} p-4 lg:px-8`}
    >
      {loadingUser && <Loading />}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] max-w-8xl mx-auto">
        <div className="w-full lg:w-1/3 xl:w-1/4 min-w-0">
          <ConversationList
            conversations={conversations}
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversationId}
            onNewChatClick={() => setShowNewDirectChatModal(true)}
            onNewGroupClick={() => setShowNewGroupChatModal(true)}
            loadingConversations={loadingConversations}
          />
        </div>
        <div className="flex-1 min-w-0">
          <ChatWindow selectedConversation={selectedConversation} />
        </div>
      </div>
      <NewDirectChatModal
        isOpen={showNewDirectChatModal}
        onClose={() => setShowNewDirectChatModal(false)}
        onChatCreated={handleChatCreated}
      />
      <NewGroupChatModal
        isOpen={showNewGroupChatModal}
        onClose={() => setShowNewGroupChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};

Communication.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Communication;
