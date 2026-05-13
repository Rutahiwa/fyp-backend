'use client';

import { useState } from 'react';
import { useAuditLogs } from './query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { DataTableSkeleton } from '@/components/admin/ui/DataTableSkeleton';
import { auditLogsColumns } from '@/components/admin/audit-logs/AuditLogsColumns';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  
  const { data, isLoading } = useAuditLogs({ 
    page, 
    pageSize: 20, 
    action: actionFilter || undefined,
    userId: userIdFilter || undefined
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Audit Logs</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Traceability for all critical system operations.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Filter by Action (e.g. LOGIN)"
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', outline: 'none' }}
          />
          <input
            type="text"
            placeholder="Search by User ID"
            value={userIdFilter}
            onChange={(e) => { setUserIdFilter(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', outline: 'none' }}
          />
        </div>
      </div>

      {isLoading ? (
        <DataTableSkeleton columns={6} rows={15} />
      ) : (
        <DataTable 
          columns={auditLogsColumns} 
          data={data?.data || []} 
          pagination={{
            page,
            total: data?.meta?.total || 0,
            pageSize: 20,
            onPageChange: setPage
          }}
        />
      )}
    </div>
  );
}
