'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getLostFound, 
  getLostFoundItem, 
  updateLostFound, 
  resolveLostFound, 
  deleteLostFound, 
  GetLostFoundParams 
} from '@/app/(admin)/actions/lost-found';

export function useLostFound(params: GetLostFoundParams = {}) {
  return useQuery({
    queryKey: ['lost-found', params],
    queryFn: () => getLostFound(params),
  });
}

export function useLostFoundItem(id: string) {
  return useQuery({
    queryKey: ['lost-found', id],
    queryFn: () => getLostFoundItem(id),
    enabled: !!id,
  });
}

export function useUpdateLostFound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLostFound(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['lost-found'] });
      qc.invalidateQueries({ queryKey: ['lost-found', variables.id] });
    },
  });
}

export function useResolveLostFound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveLostFound(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['lost-found'] });
      qc.invalidateQueries({ queryKey: ['lost-found', id] });
    },
  });
}

export function useDeleteLostFound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLostFound(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lost-found'] }),
  });
}
