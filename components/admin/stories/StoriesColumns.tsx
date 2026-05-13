import { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

export const storiesColumns = ({ onDelete }: { onDelete: (id: string) => void }): ColumnDef<any>[] => [
  {
    accessorKey: 'mediaUrl',
    header: 'Preview',
    cell: ({ row }) => {
      const url = row.original.mediaUrl;
      return (
        <div style={{ width: '48px', height: '48px', position: 'relative', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--surface-hover)' }}>
          {url ? (
            <img 
              src={url} 
              alt="Story Preview" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
             <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
               No IMG
             </div>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'expiresAt',
    header: 'Expires At',
    cell: ({ row }) => {
      const expires = row.original.expiresAt;
      if (!expires) return '-';
      const date = new Date(expires);
      const isExpired = date < new Date();
      return (
        <span style={{ color: isExpired ? 'var(--danger)' : 'var(--text)' }}>
          {date.toLocaleString()}
          {isExpired && ' (Expired)'}
        </span>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Uploaded On',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => onDelete(row.original.id)}
          style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '6px' }}
          title="Delete Story"
        >
          <Trash2 size={16} />
        </button>
      </div>
    )
  }
];
