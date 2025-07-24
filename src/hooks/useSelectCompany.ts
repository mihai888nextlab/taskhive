import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeContext';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';

export function useSelectCompany() {
  const { user, refetchUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations('SelectCompany');
  const router = useRouter();
  const [invitations, setInvitations] = useState<{ _id: string; token: string; companyId?: { name?: string }; status?: string }[]>([]);
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);

  const handleSelectCompany = useCallback(async (companyId: string) => {
    const res = await fetch('/api/auth/change-company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId }),
    });
    if (!res.ok) return;
    router.push('/app/');
    router.reload();
  }, [router]);

  const handleAcceptInvitation = useCallback(async (invitationId: string) => {
    const res = await fetch('/api/invitations/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId: invitationId }),
    });
    if (!res.ok) return;
    fetchInvitations();
    refetchUser();
  }, [refetchUser]);

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch('/api/invitations/fetchInvitations');
      const data = await res.json();
      if (Array.isArray(data.invitations)) setInvitations(data.invitations);
      else setInvitations([]);
    } catch {
      setInvitations([]);
    }
  }, []);

  useEffect(() => {
    if (user?._id) return;
    fetchInvitations();
  }, [user?._id, fetchInvitations]);

  return {
    user,
    theme,
    t,
    invitations,
    addCompanyOpen,
    setAddCompanyOpen,
    handleSelectCompany,
    handleAcceptInvitation,
    fetchInvitations,
    refetchUser,
  };
}
