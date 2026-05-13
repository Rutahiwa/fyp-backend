'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getStories, 
  createStory, 
  deleteStory,
  CreateStoryData
} from '@/app/(admin)/actions/stories';

export function useStories() {
  return useQuery({
    queryKey: ['stories'],
    queryFn: () => getStories(),
  });
}

export function useCreateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStoryData) => createStory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stories'] }),
  });
}

export function useDeleteStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stories'] }),
  });
}
