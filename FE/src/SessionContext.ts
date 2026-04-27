import { useAuth } from "./context/AuthContext";

export interface Session {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    image?: string;
  };
}

export const useSession = () => {
  const auth = useAuth();
  return {
    session: auth.user
      ? {
          user: {
            id: auth.user.id,
            name: auth.user.name,
            email: auth.user.email,
            role: auth.user.role,
          },
        }
      : null,
    setSession: (session: Session | null) => {
      auth.setUser(
        session
          ? {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              role: session.user.role,
            }
          : null,
      );
    },
    loading: auth.loading,
  };
};

export default {} as never;