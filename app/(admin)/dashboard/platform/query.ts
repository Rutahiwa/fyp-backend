'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getColleges, 
  createCollege,
  deleteCollege,
  getDepartments,
  createDepartment,
  deleteDepartment,
  getProgrammes,
  createProgramme,
  updateProgramme,
  deleteProgramme,
  getAcademicYears,
  createAcademicYear,
  setCurrentAcademicYear
} from '@/app/(admin)/actions/platform';

// COLLEGES
export function useColleges() {
  return useQuery({
    queryKey: ['colleges'],
    queryFn: () => getColleges(),
  });
}

export function useCreateCollege() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; shortName: string }) => createCollege(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['colleges'] }),
  });
}

export function useDeleteCollege() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCollege(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['colleges'] }),
  });
}

// DEPARTMENTS
export function useDepartments(collegeId?: string) {
  return useQuery({
    queryKey: ['departments', collegeId],
    queryFn: () => getDepartments(collegeId),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; shortName: string; collegeId: string }) => createDepartment(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
}

// PROGRAMMES
export function useProgrammes(collegeId?: string) {
  return useQuery({
    queryKey: ['programmes', collegeId],
    queryFn: () => getProgrammes(collegeId),
  });
}

export function useCreateProgramme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string; departmentId: string; durationYears: number }) => createProgramme(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['programmes'] }),
  });
}

export function useUpdateProgramme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProgramme(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['programmes'] }),
  });
}

export function useDeleteProgramme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProgramme(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['programmes'] }),
  });
}

// ACADEMIC YEARS
export function useAcademicYears() {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: () => getAcademicYears(),
  });
}

export function useCreateAcademicYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { year: string; startDate: string; endDate: string; isCurrent?: boolean }) => createAcademicYear(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic-years'] }),
  });
}

export function useSetCurrentAcademicYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setCurrentAcademicYear(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic-years'] }),
  });
}
