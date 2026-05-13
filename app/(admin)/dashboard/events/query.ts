'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getEvents, 
  getEvent, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getEventAttendees,
  getEventCategories,
  GetEventsParams,
  CreateEventData
} from '@/app/(admin)/actions/events';

export function useEvents(params: GetEventsParams = {}) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => getEvents(params),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => getEvent(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventData) => createEvent(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventData> }) => updateEvent(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['events', variables.id] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useEventAttendees(id: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['events', id, 'attendees', page, pageSize],
    queryFn: () => getEventAttendees(id, page, pageSize),
    enabled: !!id,
  });
}

export function useEventCategories() {
  return useQuery({
    queryKey: ['event-categories'],
    queryFn: () => getEventCategories(),
  });
}
