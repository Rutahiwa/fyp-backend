'use client';

import { useEvents, useUpdateEvent, useDeleteEvent } from './query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/admin/ui/Badge';
import { CheckCircle, XCircle, Trash2, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EventsPage() {
  const { data, isLoading } = useEvents();
  const { mutate: updateEvent } = useUpdateEvent();
  const { mutate: deleteEvent } = useDeleteEvent();

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'title', header: 'Title', cell: ({ row }) => <span style={{ fontWeight: 500 }}>{row.original.title}</span> },
    { accessorKey: 'location', header: 'Location' },
    { 
      accessorKey: 'startTime', 
      header: 'Start', 
      cell: ({ row }) => new Date(row.original.startTime).toLocaleString() 
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status;
        return <Badge variant={s === 'UPCOMING' ? 'info' : s === 'ONGOING' ? 'success' : 'default'}>{s}</Badge>;
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Link href={`/dashboard/events/${event.id}/edit`} style={{ display: 'flex', alignItems: 'center', padding: '4px', backgroundColor: 'transparent', borderRadius: '4px', color: 'var(--info)' }} title="Edit Event">
                <Pencil size={16} />
              </Link>
              <button 
                onClick={() => updateEvent({ id: event.id, data: { status: event.status === 'CANCELLED' ? 'PUBLISHED' : 'CANCELLED' }})}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                title={event.status === 'CANCELLED' ? 'Restore' : 'Cancel Event'}
              >
                {event.status === 'CANCELLED' ? <CheckCircle size={16} color="var(--success)" /> : <XCircle size={16} color="var(--warning)" />}
              </button>
              <button 
                onClick={() => { if(confirm('Delete event?')) deleteEvent(event.id); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--danger)' }}
              >
                <Trash2 size={16} />
              </button>
          </div>
        )
      }
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Events</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage university and student events.</p>
        </div>
        <Link href="/dashboard/events/create" style={{ padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          <Plus size={16} /> Create Event
        </Link>
      </div>

      <DataTable columns={columns} data={data?.data || []} />
    </div>
  );
}
