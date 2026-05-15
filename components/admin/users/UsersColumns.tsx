import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/admin/ui/Badge';
import { Power, PowerOff, Trash2 } from 'lucide-react';
import Link from 'next/link';

export const usersColumns = ({
  onToggleStatus,
  onDelete,
}: {
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDelete?: (user: any) => void;
}): ColumnDef<any>[] => [
  {
    accessorKey: 'fullName',
    header: 'Name',
    cell: ({ row }) => (
      <Link href={`/dashboard/users/${row.original.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div>
          <div style={{ fontWeight: 500, color: 'var(--info)' }}>{row.original.fullName}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.original.email}</div>
        </div>
      </Link>
    ),
  },
  {
    accessorKey: 'registrationNumber',
    header: 'Reg Number',
  },
  {
    accessorKey: 'roleName',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.original.roleName || 'Unknown';
      return (
        <Badge variant={role === 'admin' ? 'info' : 'default'}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'success' : 'danger'}>
          {isActive ? 'Active' : 'Deactivated'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            style={{ ...actionBtn, color: user.isActive ? 'var(--warning)' : '#3fb950' }}
            onClick={() => onToggleStatus(user.id, user.isActive)}
            title={user.isActive ? 'Deactivate User' : 'Activate User'}
          >
            {user.isActive ? <PowerOff size={16} /> : <Power size={16} />}
          </button>

          {onDelete && (
            <button
              style={{ ...actionBtn, color: 'var(--danger)' }}
              onClick={() => onDelete(user)}
              title="Delete User"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      );
    },
  },
];

const actionBtn: React.CSSProperties = {
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.15s, color 0.15s',
};
