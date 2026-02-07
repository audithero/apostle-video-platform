import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth/auth-client';
import type { UserRole } from '@/lib/auth/permissions';

const userQueryKeys = {
  all: ['users'] as const,
  list: () => [...userQueryKeys.all, 'list'] as const,
  sessions: () => ['sessions'] as const,
};

export const useUsers = () => {
  return useQuery({
    queryKey: userQueryKeys.list(),
    queryFn: async () => {
      const data = await authClient.admin.listUsers(
        {
          query: {
            limit: 10,
            sortBy: 'createdAt',
            sortDirection: 'desc',
          },
        },
        {
          throw: true,
        }
      );

      return data?.users || [];
    },
    retry: (failureCount, error: Error) => {
      if (error?.message?.includes('forbidden')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useSessions = () => {
  return useQuery({
    queryKey: userQueryKeys.sessions(),
    queryFn: async () => {
      const getSession = authClient.getSession();
      const getSessions = authClient.listSessions();
      const [session, sessions] = await Promise.all([getSession, getSessions]);
      return { session, sessions } as const;
    },
    retry: (failureCount, error: Error) => {
      if (error?.message?.includes('forbidden')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      name,
      role,
    }: {
      email: string;
      password: string;
      name: string;
      role?: UserRole | UserRole[];
    }) => {
      const result = await authClient.admin.createUser({
        email,
        password,
        name,
        role: (role || 'user') as "user" | "admin",
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to create user');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
    },
    onError: (error: Error) => {
      console.error('Create user error:', error);
    },
  });
};

export const useRemoveUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const result = await authClient.admin.removeUser({
        userId,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to remove user');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
    },
    onError: (error: Error) => {
      console.error('Remove user error:', error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const result = await authClient.admin.removeUser({
        userId,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to delete user');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
    },
    onError: (error: Error) => {
      console.error('Delete user error:', error);
    },
  });
};

export const useSetUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const result = await authClient.admin.setRole({
        userId,
        role: role as "user" | "admin",
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to set user role');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
    },
    onError: (error: Error) => {
      console.error('Set user role error:', error);
    },
  });
};

export const useResetUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const result = await authClient.admin.setUserPassword({
        userId,
        newPassword: password,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to reset user password');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
    },
    onError: (error: Error) => {
      console.error('Reset user password error:', error);
    },
  });
};

export const useRevokeUserSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const result = await authClient.admin.revokeUserSessions({
        userId,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to revoke user sessions');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.sessions() });
    },
    onError: (error: Error) => {
      console.error('Revoke user sessions error:', error);
    },
  });
};

export const useImpersonateUser = () => {
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const result = await authClient.admin.impersonateUser({
        userId,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to impersonate user');
      }

      return result;
    },
    onError: (error: Error) => {
      console.error('Impersonate user error:', error);
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const result = await authClient.admin.banUser({
        userId,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to ban user');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
    },
    onError: (error: Error) => {
      console.error('Ban user error:', error);
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const result = await authClient.admin.unbanUser({
        userId,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to unban user');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
    },
    onError: (error: Error) => {
      console.error('Unban user error:', error);
    },
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token }: { token: string }) => {
      const result = await authClient.revokeSession({
        token,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to revoke session');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.sessions() });
    },
    onError: (error: Error) => {
      console.error('Revoke session error:', error);
    },
  });
};

export const useSendVerificationEmail = () => {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const result = await authClient.sendVerificationEmail(
        {
          email,
        },
        {
          throw: true,
        }
      );

      if (!result.status) {
        throw new Error('Failed to send verification email');
      }

      return result;
    },
    onError: (error: Error) => {
      console.error('Send verification email error:', error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, image }: { name?: string; image?: string }) => {
      const result = await authClient.updateUser({
        name,
        image,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update user');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    onError: (error: Error) => {
      console.error('Update user error:', error);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
      revokeOtherSessions,
    }: {
      currentPassword: string;
      newPassword: string;
      revokeOtherSessions?: boolean;
    }) => {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to change password');
      }

      return result;
    },
    onError: (error: Error) => {
      console.error('Change password error:', error);
    },
  });
};
