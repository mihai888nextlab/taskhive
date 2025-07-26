import React from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import ConversationList from "@/components/chat/ConversationList";
import NewDirectChatModal from "@/components/chat/NewDirectChatModel";
import NewGroupChatModal from "@/components/chat/NewGroupChatModal";
import { useCommunication } from "@/hooks/useCommunication";

const Communication: NextPageWithLayout = () => {
  const {
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
  } = useCommunication();

  return (
    <div
      className={`relative ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} p-4 lg:px-8`}
    >
      {loadingUser}
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
