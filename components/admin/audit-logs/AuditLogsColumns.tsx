import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/admin/ui/Badge';
import { UAParser } from 'ua-parser-js';
import { Activity } from 'lucide-react';

export const auditLogsColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Timestamp',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div>
          <div style={{ fontWeight: 500 }}>{date.toLocaleDateString()}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{date.toLocaleTimeString()}</div>
        </div>
      );
    }
  },
  {
    accessorKey: 'user.fullName',
    header: 'User',
    cell: ({ row }) => {
      return (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--text)' }}>
            {row.original.userFullName || row.original.user?.fullName || 'System'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {row.original.userEmail || row.original.user?.email || ''}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const actionRaw = row.original.action || '';
      // Make action human readable: CREATE_ANNOUNCEMENT -> "Created Announcement"
      const actionReadable = actionRaw
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
        
      let colorType: 'success' | 'warning' | 'danger' | 'info' | 'default' = 'default';
      if (actionRaw.includes('LOGIN')) colorType = 'success';
      if (actionRaw.includes('CREATE')) colorType = 'info';
      if (actionRaw.includes('UPDATE')) colorType = 'warning';
      if (actionRaw.includes('DELETE') || actionRaw.includes('REMOVE')) colorType = 'danger';

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={14} color={`var(--${colorType})`} />
          <Badge variant={colorType}>{actionReadable}</Badge>
        </div>
      );
    }
  },
  {
    accessorKey: 'entityType',
    header: 'Resource',
    cell: ({ row }) => {
      const entity = row.original.entityType || row.original.entity;
      return entity ? (
        <div>
          <div style={{ fontWeight: 500 }}>{entity}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            ID: {row.original.entityId?.slice(0,8) || 'N/A'}...
          </div>
        </div>
      ) : '—';
    }
  },
  {
    accessorKey: 'ipAddress',
    header: 'Network',
    cell: ({ row }) => {
      return (
        <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          {row.original.ipAddress || '—'}
        </span>
      );
    }
  },
  {
    accessorKey: 'userAgent',
    header: 'Device Safari/Chrome',
    cell: ({ row }) => {
      const uaRaw = row.original.userAgent;
      if (!uaRaw) return '—';
      
      try {
        const parser = new UAParser(uaRaw);
        const browser = parser.getBrowser();
        const os = parser.getOS();
        
        if (browser.name) {
          return (
             <div style={{ fontSize: '13px' }}>
               <div>{browser.name} {browser.version?.split('.')[0]}</div>
               <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{os.name} {os.version}</div>
             </div>
          );
        }
      } catch (e) {
        // Fallback
      }
      return <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{uaRaw.slice(0, 25)}...</span>;
    }
  }
];
