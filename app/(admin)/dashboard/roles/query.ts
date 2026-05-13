'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getRoles, 
  getRole, 
  createRole, 
  updateRole, 
  deleteRole, 
  getPermissions 
} from '@/app/(admin)/actions/roles';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles(),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => getRole(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; permissions?: string[] }) => createRole(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; permissions?: string[] } }) => updateRole(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      qc.invalidateQueries({ queryKey: ['roles', variables.id] });
    },
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => getPermissions(),
  });
}
