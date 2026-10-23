import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
// Types
import type { ActionResult, AuthNotice, Profile } from "@/types/auth";
import type { ProfileUpdate, UserRole } from "@/types/auth";

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isApprovedUser: boolean;
  /** True until the session AND the profile have both resolved */
  authLoading: boolean;
  /** Set when a signed-in user was rejected (pending approval, missing profile) */
  authNotice: AuthNotice;
  updateProfile: (patch: ProfileUpdate) => Promise<ActionResult>;
  resetPassword: () => Promise<ActionResult>;
  signOut: () => Promise<ActionResult>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
