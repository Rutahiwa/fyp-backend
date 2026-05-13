'use client';

import { useGroups, useUpdateGroup, useDeleteGroup } from './query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/admin/ui/Badge';
import { CheckCircle, ShieldCheck, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function GroupsPage() {
  const { data, isLoading } = useGroups();
  const { mutate: updateGroup } = useUpdateGroup();
  const { mutate: deleteGroup } = useDeleteGroup();

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Group Info',
      cell: ({ row }) => (
        <div>
          <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {row.original.name}
            {row.original.isOfficial && <ShieldCheck size={14} color="var(--info)" />}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.original.description || 'No description'}</div>
        </div>
      )
    },
    {
       accessorKey: 'isOfficial',
       header: 'Type',
       cell: ({ row }) => row.original.isOfficial ? <Badge variant="info">Official</Badge> : <Badge variant="default">Student</Badge>
    },
    {
       accessorKey: 'isActive',
       header: 'Status',
       cell: ({ row }) => row.original.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Suspended</Badge>
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const group = row.original;
        return (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => updateGroup({ id: group.id, data: { isActive: !group.isActive } as any })}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
              title={group.isActive ? 'Suspend' : 'Activate'}
            >
              {group.isActive ? <XCircle size={16} color="var(--warning)" /> : <CheckCircle size={16} color="var(--success)" />}
            </button>
            <button 
              onClick={() => {
                if(confirm('Delete this group?')) deleteGroup(group.id);
              }}
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
        <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Groups</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage student and official groups (moderation).</p>
      </div>

      <DataTable 
        columns={columns} 
        data={data?.data || []} 
      />
    </div>
  );
}
