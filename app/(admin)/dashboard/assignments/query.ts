'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getLecturerAssignments, 
  createLecturerAssignment,
  getCrAssignments,
  createCrAssignment
} from '@/app/(admin)/actions/assignments';

// LECTURERS
export function useLecturerAssignments() {
  return useQuery({
    queryKey: ['lecturer-assignments'],
    queryFn: () => getLecturerAssignments(),
  });
}

export function useCreateLecturerAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createLecturerAssignment(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lecturer-assignments'] }),
  });
}

// CLASS REPS
export function useCrAssignments() {
  return useQuery({
    queryKey: ['cr-assignments'],
    queryFn: () => getCrAssignments(),
  });
}

export function useCreateCrAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createCrAssignment(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cr-assignments'] }),
  });
}
