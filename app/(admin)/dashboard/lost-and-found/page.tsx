'use client';

import { useLostFound, useResolveLostFound, useDeleteLostFound } from './query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/admin/ui/Badge';
import { CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LostFoundPage() {
  const { data, isLoading } = useLostFound();
  const { mutate: resolveItem } = useResolveLostFound();
  const { mutate: deleteItem } = useDeleteLostFound();

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'title', header: 'Item' },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <Badge variant={row.original.type === 'LOST' ? 'warning' : 'info'}>{row.original.type}</Badge> },
    { accessorKey: 'location', header: 'Location' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'RESOLVED' ? 'success' : 'default'}>{row.original.status}</Badge> },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
             {item.status !== 'RESOLVED' && (
               <button 
                  onClick={() => resolveItem(item.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--success)' }}
                  title={'Mark Resolved'}
                >
                  <CheckCircle size={16} />
                </button>
             )}
              <button 
                onClick={() => { if(confirm('Delete item?')) deleteItem(item.id); }}
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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Lost & Found</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Moderate reported lost items.</p>
      </div>

      <DataTable columns={columns} data={data?.data || []} />
    </div>
  );
}
