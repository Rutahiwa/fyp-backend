import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/admin/ui/Badge';
import { MoreHorizontal, Power, PowerOff } from 'lucide-react';
import Link from 'next/link';

export const usersColumns = ({ onToggleStatus }: { onToggleStatus: (id: string, isActive: boolean) => void }): ColumnDef<any>[] => [
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
    }
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
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      const isSelf = false; // Could pass currentUser logic if needed
      
      return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button 
            style={{ ...styles.actionBtn, color: user.isActive ? 'var(--warning)' : 'var(--success)' }}
            onClick={() => onToggleStatus(user.id, user.isActive)}
            title={user.isActive ? 'Deactivate User' : 'Activate User'}
          >
            {user.isActive ? <PowerOff size={16} /> : <Power size={16} />}
          </button>
          
          <button style={styles.actionBtn} title="View Details">
            <MoreHorizontal size={16} />
          </button>
        </div>
      );
    }
  }
];

const styles = {
  actionBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s, color 0.15s'
  }
};
