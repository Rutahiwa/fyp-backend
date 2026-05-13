'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getColleges, 
  createCollege,
  updateCollege,
  deleteCollege,
  getDepartments,
  createDepartment,
  updateDepartment,
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
    mutationFn: async (data: { name: string; shortName: string }) => {
      const res = await createCollege(data);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['colleges'] }),
  });
}

export function useUpdateCollege() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await updateCollege(id, data);
      if (res.error) throw new Error(res.error);
      return res;
    },
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
    mutationFn: async (data: { name: string; shortName: string; collegeId: string }) => {
      const res = await createDepartment(data);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await updateDepartment(id, data);
      if (res.error) throw new Error(res.error);
      return res;
    },
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
    mutationFn: async (data: { name: string; code: string; departmentId: string; durationYears: number }) => {
      const res = await createProgramme(data);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['programmes'] }),
  });
}

export function useUpdateProgramme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await updateProgramme(id, data);
      if (res.error) throw new Error(res.error);
      return res;
    },
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
