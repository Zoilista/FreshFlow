'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export interface Profile {
  id: string;
  full_name: string | null;
  business_name: string | null;
  business_type: string;
  city: string | null;
  country: string | null;
  email: string | null;
  created_at: string;
}

interface UseUserReturn {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Client'ı bir kez oluştur — her render'da yeni instance açılmasın
  const supabase = useMemo(() => createClient(), []);

  // Profil çekme işlemini ref ile takip et (çift fetch'i önle)
  const fetchingRef = useRef<string | null>(null);

  async function fetchProfile(userId: string) {
    // Aynı kullanıcı için zaten fetch varsa atla
    if (fetchingRef.current === userId) return;
    fetchingRef.current = userId;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    } else {
      setProfile(null);
    }

    fetchingRef.current = null;
    setLoading(false);
  }

  useEffect(() => {
    // onAuthStateChange: INITIAL_SESSION event'i sayfa yüklenince
    // hemen tetiklenir — bu getUser()'a göre daha güvenilirdir.
    // Production'da cookie-based session'ı bu şekilde okur.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Session varsa profili çek; email'i hemen göster
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  return { user, profile, loading };
}
