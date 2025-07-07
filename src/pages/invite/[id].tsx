import { useAuth } from "@/hooks/useAuth";

export default function InvitePage() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <p>You must be logged in to view this page.</p>;
  }

  return (
    <div>
      <h1>Invite Page</h1>
      <p>This page is for inviting users to a company.</p>
      {/* Add your invite form or logic here */}
    </div>
  );
}
