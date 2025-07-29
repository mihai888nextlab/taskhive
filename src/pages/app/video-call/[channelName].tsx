import React, { useCallback } from "react";
import { GetServerSideProps, NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "@/types";
import dbConnect from "@/db/dbConfig";
import conversationModel from "@/db/models/conversationsModel";

const VideoCallWrapper = dynamic(
  () => import("@/components/video-call/AgoraCallWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-pulse text-blue-500 text-xl">
          Loading video call...
        </div>
      </div>
    ),
  }
);

interface VideoCallPageProps {
  channelName: string;
  chatName: string | null;
}

const VideoCallPage: NextPageWithLayout<VideoCallPageProps> = ({
  channelName,
  chatName,
}) => {
  const router = useRouter();

  const handleGoBack = useCallback(() => {
    router.push("/app");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1">
        <VideoCallWrapper channelName={channelName} chatName={chatName} />
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<
  VideoCallPageProps
> = async (context) => {
  const { channelName } = context.query;

  if (typeof channelName !== "string" || !channelName.trim()) {
    return {
      notFound: true,
    };
  }

  await dbConnect();
  let chatName: string | null = null;
  try {
    const convo = await conversationModel
      .findById(channelName)
      .select("name")
      .lean();
    chatName =
      convo && typeof convo === "object" && "name" in convo
        ? (convo as { name?: string }).name || null
        : null;
  } catch {
    chatName = null;
  }

  return {
    props: {
      channelName: channelName.trim(),
      chatName,
    },
  };
};

VideoCallPage.getLayout = (page: React.ReactNode) => {
  return page;
};

export default VideoCallPage;
