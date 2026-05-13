'use client';

import { useState } from 'react';
import { useUsers, useUpdateUser } from './query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { DataTableSkeleton } from '@/components/admin/ui/DataTableSkeleton';
import { usersColumns } from '@/components/admin/users/UsersColumns';
import { toast } from 'sonner';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data, isLoading, isError } = useUsers({ page, pageSize: 20, search });
  const { mutate: updateUser } = useUpdateUser();

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    updateUser(
      { id: userId, data: { isActive: !currentStatus } },
      {
        onSuccess: () => toast.success(`User set to ${!currentStatus ? 'Active' : 'Inactive'}`),
        onError: () => toast.error('Failed to change user status'),
      }
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Users</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage platform users, roles, and access.</p>
        </div>
        
        <div>
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              width: '280px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <DataTableSkeleton columns={6} rows={10} />
      ) : isError ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--danger)' }}>
          Failed to load users.
        </div>
      ) : (
        <DataTable
          columns={usersColumns({ onToggleStatus: handleToggleStatus })}
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
