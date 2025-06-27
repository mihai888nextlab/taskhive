// pages/dashboard/video-call/[channelName].tsx
import React from "react";
import { GetServerSideProps, NextPage } from "next";
// import DashboardLayout from '../../../components/DashboardLayout';
// import AgoraVideoCall from "@/components/video-call/AgoraVideoCall";
import dynamic from "next/dynamic";
// import { verifyAuthToken } from "../../../src/utils/auth";

const AgoraVideoCall = dynamic(
  () => import("@/components/video-call/AgoraVideoCall"),
  { ssr: false } // This is the crucial part!
);

// Tipul pentru o pagină cu layout
type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

interface VideoCallPageProps {
  channelName: string;
}

const VideoCallPage: NextPageWithLayout = () => {
  const channelName = "test-channel"; // Poți obține acest nume din URL sau din props
  if (!channelName) {
    return (
      <div className="text-center text-red-500 py-8">
        Error: Channel name not provided.
      </div>
    );
  }
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Video Call: {channelName}
      </h1>
      <AgoraVideoCall channelName={channelName} />
    </div>
  );
};

// Protejează ruta cu getServerSideProps pentru a asigura autentificarea
// export const getServerSideProps: GetServerSideProps<VideoCallPageProps> = async (context) => {
//   const authResult = await verifyAuthToken(context.req);

//   if (!authResult || !authResult.userId) {
//     return {
//       redirect: {
//         destination: '/auth/login',
//         permanent: false,
//       },
//     };
//   }

//   const channelName = "test-channel";

//   if (typeof channelName !== 'string' || !channelName) {
//     return {
//       notFound: true, // Sau redirecționează către o pagină de eroare
//     };
//   }

//   return {
//     props: {
//       channelName,
//     },
//   };
// };

// VideoCallPage.getLayout = function getLayout(page: React.ReactElement) {
//   return <DashboardLayout>{page}</DashboardLayout>;
// };

export default VideoCallPage;
