import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/router";

export default function InvitePage() {
  const auth = useAuth();
  const router = useRouter();

  const { inviteId } = router.query;

  const handleAcceptInvite = async () => {
    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteId }), // Replace with actual invite ID
      });

      if (!response.ok) {
        throw new Error("Failed to accept invite");
      }

      const data = await response.json();
      console.log("Invite accepted:", data);
      // Redirect or update UI as needed
    } catch (error) {
      console.error("Error accepting invite:", error);
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>You must be logged in to access this page.</p>
        <Link href="/login">REDIRECT TO LOGIN</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Invite Page</h1>
      <p>This page is for inviting users to a company.</p>

      <button onClick={handleAcceptInvite}>AACEPT INVITE</button>
      {/* Add your invite form or logic here */}
    </div>
  );
}
