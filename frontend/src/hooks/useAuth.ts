'use client';

import { api } from '@/lib/api';
import { User } from '@/lib/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

async function fetchMe(): Promise<User | null> {
  try {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data.user;
  } catch {
    return null;
  }
}

export function useAuth() {
  const query = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export function useAuthActions() {
  const qc = useQueryClient();
  return {
    setUser(user: User) {
      qc.setQueryData(['me'], user);
    },
    async refresh() {
      await qc.invalidateQueries({ queryKey: ['me'] });
    },
    clear() {
      qc.setQueryData(['me'], null);
      qc.clear();
    },
  };
}
