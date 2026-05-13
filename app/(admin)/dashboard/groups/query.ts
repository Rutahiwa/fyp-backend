'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getGroups, 
  getGroup, 
  createGroup, 
  updateGroup, 
  deleteGroup, 
  GetGroupsParams,
  CreateGroupData
} from '@/app/(admin)/actions/groups';

export function useGroups(params: GetGroupsParams = {}) {
  return useQuery({
    queryKey: ['groups', params],
    queryFn: () => getGroups(params),
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => getGroup(id),
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupData) => createGroup(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGroupData> }) => updateGroup(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['groups', variables.id] });
    },
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}
