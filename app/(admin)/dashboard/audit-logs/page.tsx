'use client';

import { useAuditLogs } from './query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/admin/ui/Badge';

export default function AuditLogsPage() {
  const { data, isLoading } = useAuditLogs();

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'createdAt', header: 'Timestamp', cell: ({ row }) => new Date(row.original.createdAt).toLocaleString() },
    { accessorKey: 'action', header: 'Action', cell: ({ row }) => <Badge variant="default">{row.original.action}</Badge> },
    { accessorKey: 'entityType', header: 'Resource' },
    { accessorKey: 'user.email', header: 'Performed By', cell: ({ row }) => row.original.user?.email || 'System' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Audit Logs</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Traceability for all critical admin operations.</p>
      </div>

      <DataTable columns={columns} data={data?.data || []} />
    </div>
  );
}
