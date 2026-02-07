import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ErrorContext } from "better-auth/react";
import { authClient } from "@/lib/auth/auth-client";

const authQueryKeys = {
  session: ["session"],
};

export const useSession = () => {
  const session = authClient.useSession();
  return session;
};

export const useLogin = () => {
  const router = useRouter();
  const loginWithCredentials = useMutation({
    mutationFn: async ({ email, password, rememberMe }: { email: string; password: string; rememberMe?: boolean }) => {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe: rememberMe ?? false,
      });

      if (result.error) {
        throw new Error(result.error.message || "Authentication failed");
      }

      return result;
    },
    onSuccess(response) {
      if (response.data?.user.id) {
        router.navigate({ to: "/" });
      }
    },
    onError(error: any) {
      console.error("Login error:", error);
    },
  });

  return {
    loginWithCredentials,
  };
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => await authClient.signOut(),
    onSettled: async () => {
      queryClient.removeQueries({ queryKey: authQueryKeys.session });
      await router.navigate({ to: "/login" });
    },
  });
};

export const useRegister = ({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (error: ErrorContext) => void;
}) =>
  useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) =>
      await authClient.signUp.email(
        { email, password, name },
        {
          onSuccess: () => {
            onSuccess();
          },
          onError: (error: ErrorContext) => {
            onError(error);
          },
        }
      ),
  });

export const useAuthHelpers = () => {
  const forgotPassword = useMutation({
    mutationFn: async ({ email }: { email: string }) =>
      await authClient.resetPassword({ email, redirectTo: "/reset-password" } as never),
  });

  const resetPassword = useMutation({
    mutationFn: async ({ newPassword, token }: { newPassword: string; token: string }) =>
      await authClient.resetPassword({ newPassword, token }),
  });

  const sendVerificationEmail = useMutation({
    mutationFn: async ({ email }: { email: string }) => await authClient.sendVerificationEmail({ email }),
  });

  const verifyEmail = useMutation({
    mutationFn: async ({ token }: { token: string }) => await authClient.verifyEmail({ query: { token } }),
  });

  const revokeSession = useMutation({
    mutationFn: async ({ token }: { token: string }) => await authClient.revokeSession({ token }),
  });

  const signOut = useMutation({
    mutationFn: async () => await authClient.signOut(),
  });

  return {
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    verifyEmail,
    revokeSession,
    signOut,
  };
};
