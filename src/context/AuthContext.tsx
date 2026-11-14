import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<string | null>;
};

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthCtx = {
    user: session?.user ?? null,
    loading,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? error.message : null;
    },
    resetPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      return error ? error.message : null;
    },
    signUp: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) return error.message;
      if (!data.session) return 'Check your inbox to confirm your email, then sign in.';
      return null;
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
    deleteAccount: async () => {
      const { error } = await supabase.rpc('delete_my_account');
      if (error) return error.message;
      await supabase.auth.signOut();
      return null;
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
