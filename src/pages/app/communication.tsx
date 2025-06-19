import React from 'react';
import ChatWindow from "@/components/chat/ChatWindow";
import DashboardLayout from "@/components/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { h1 } from "framer-motion/client";
import { useAuth } from "../_app";
import { useEffect, useState } from "react";
import ConversationList, {
  PopulatedConversation,
} from "@/components/chat/ConversationList";
import Loading from "@/components/Loading";
import NewDirectChatModal from "@/components/chat/NewDirectChatModel";
import NewGroupChatModal from "@/components/chat/NewGroupChatModal";
import { useTheme } from '@/components/ThemeContext';

const Communication: NextPageWithLayout = () => {
  const { user, loadingUser } = useAuth();
  const [conversations, setConversations] = useState<PopulatedConversation[]>(
    []
  );
  const [selectedConversation, setSelectedConversation] =
    useState<PopulatedConversation | null>(null);
  const [showNewDirectChatModal, setShowNewDirectChatModal] = useState(false);
  const [showNewGroupChatModal, setShowNewGroupChatModal] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

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

  const handleChatCreated = (newConversationId: string) => {
    // Re-fetch conversations to get the new one and update the list
    if (user) {
      fetch(`/api/conversations?userId=${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          setConversations(data.conversations as PopulatedConversation[]);
          // Optionally, auto-select the newly created chat
          const newConvo = data.conversations.find(
            (c: PopulatedConversation) =>
              (c._id as string) === newConversationId
          );
          if (newConvo) {
            setSelectedConversation(newConvo);
          }
        })
        .catch((err) =>
          console.error("Failed to re-fetch conversations after creation", err)
        );
    }
  };

  const handleGroupChatCreated = (newConversationId: string) => {};

  return (
    <div className={`relative min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-2 sm:p-4 md:p-8 font-sans overflow-hidden`}>
      {loadingUser && <Loading />}
      <div className="flex h-[calc(100vh-100px)]">
        {" "}
        {/* Adjust height as needed */}
        <div className="w-1/4 min-w-[280px] p-4">
          <ConversationList
            conversations={conversations}
            onSelectConversation={setSelectedConversation}
            selectedConversationId={
              selectedConversation?._id?.toString() || null
            }
            onNewChatClick={() => setShowNewDirectChatModal(true)}
            onNewGroupClick={() => setShowNewGroupChatModal(true)}
            loadingConversations={loadingConversations}
          />
        </div>
        <div className="flex-1 p-4">
          <ChatWindow selectedConversation={selectedConversation} />
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
    </div>
  );
};

Communication.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Communication;
