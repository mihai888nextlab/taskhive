import React, { useCallback } from "react";
import { GetServerSideProps, NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

// Dynamically import to avoid SSR issues
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
}

const VideoCallPage: NextPage<VideoCallPageProps> = React.memo(
  ({ channelName }) => {
    const router = useRouter();

    // Memoize goBack handler
    const handleGoBack = useCallback(() => {
      router.push("/dashboard");
    }, [router]);

    if (!channelName) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Invalid Channel</div>
            <p className="text-gray-400 mb-4">Channel name not provided</p>
            <button
              onClick={handleGoBack}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return <VideoCallWrapper channelName={channelName} />;
  }
);

export const getServerSideProps: GetServerSideProps<
  VideoCallPageProps
> = async (context) => {
  const { channelName } = context.query;

  // Validate channel name
  if (typeof channelName !== "string" || !channelName.trim()) {
    return {
      notFound: true,
    };
  }

  // Optional: Add authentication check here
  // const authResult = await verifyAuthToken(context.req);
  // if (!authResult?.userId) {
  //   return {
  //     redirect: {
  //       destination: '/auth/login',
  //       permanent: false,
  //     },
  //   };
  // }

  return {
    props: {
      channelName: channelName.trim(),
    },
  };
};

export default React.memo(VideoCallPage);
