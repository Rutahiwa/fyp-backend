'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAdminFeedback,
  updateFeedbackStatus,
  GetFeedbackParams
} from '@/app/(admin)/actions/feedback';

export function useFeedback(params: GetFeedbackParams = {}) {
  return useQuery({
    queryKey: ['feedback', params],
    queryFn: () => getAdminFeedback(params),
  });
}

export function useUpdateFeedbackStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: string; status: 'PENDING' | 'REVIEWED' | 'RESOLVED'; adminNotes?: string }) => 
      updateFeedbackStatus(id, status, adminNotes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}
