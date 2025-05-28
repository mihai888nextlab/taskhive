import ChatWindow from "@/components/chat/ChatWindow";
import DashboardLayout from "@/components/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { h1 } from "framer-motion/client";
import { useAuth } from "../_app";
import { useEffect, useState } from "react";
import ConversationList, {
  PopulatedConversation,
} from "@/components/ConversationList";
import Loading from "@/components/Loading";
import NewDirectChatModal from "@/components/chat/NewDirectChatModel";

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

  useEffect(() => {
    if (!user) {
      setLoadingConversations(false);
      return;
    }

    const fetchConversations = async () => {
      setLoadingConversations(true);
      setError(null);
      try {
        const res = await fetch(`/api/conversations?userId=${user._id}`); // Fetch conversations for current user
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch conversations");
        }
        const data = await res.json();
        setConversations(data.conversations as PopulatedConversation[]);
      } catch (err: any) {
        console.error("Error fetching conversations:", err);
        setError("Nu s-au putut încărca conversațiile.");
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [user]); // Re-fetch when user changes

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

  return (
    <div>
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
        {/* <NewGroupChatModal
          isOpen={showNewGroupChatModal}
          onClose={() => setShowNewGroupChatModal(false)}
          onChatCreated={handleChatCreated}
        /> */}
      </div>
    </div>
  );
};

Communication.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Communication;
