import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import type { Profile } from "@/lib/db";

export type UseProfileResult = {
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  error: Error | null;
};

/** Loads the signed-in user's profile row plus their highest role. */
export function useProfile(): UseProfileResult {
  const { user, role, loading } = useAuth();

  const query = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return {
    profile: query.data ?? null,
    role,
    isLoading: loading || query.isLoading,
    error: (query.error as Error | null) ?? null,
  };
}
