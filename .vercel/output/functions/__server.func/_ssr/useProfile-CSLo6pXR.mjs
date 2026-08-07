import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-by8QvJ8A.mjs";
import { u as useAuth } from "./router-B82dyFaT.mjs";
function useProfile() {
  const { user, role, loading } = useAuth();
  const query = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  return {
    profile: query.data ?? null,
    role,
    isLoading: loading || query.isLoading,
    error: query.error ?? null
  };
}
export {
  useProfile as u
};
