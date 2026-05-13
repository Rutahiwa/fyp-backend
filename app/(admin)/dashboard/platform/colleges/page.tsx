'use client';

import { useState } from 'react';
import { useColleges, useCreateCollege } from '../query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { DataTableSkeleton } from '@/components/admin/ui/DataTableSkeleton';
import { ColumnDef } from '@tanstack/react-table';
import { X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function CreateCollegeModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const { mutate: createCollege, isPending } = useCreateCollege();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !shortName) return toast.error('Both fields are required');
    createCollege({ name, shortName }, {
      onSuccess: () => { toast.success('College added successfully'); onClose(); },
      onError: (err: any) => toast.error(err.message || 'Failed to add college'),
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeader}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>Add New College</h2>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={formGroup}>
            <label style={labelStyle}>Full College Name</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="College of Information and Communication Technology" required />
          </div>
          <div style={formGroup}>
            <label style={labelStyle}>Abbreviation</label>
            <input style={inputStyle} value={shortName} onChange={e => setShortName(e.target.value)} placeholder="COICT" required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={isPending} style={submitBtnStyle}>
              {isPending && <Loader2 size={14} style={{ marginRight: '6px', animation: 'spin 1s linear infinite' }} />}
              {isPending ? 'Adding...' : 'Add College'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CollegesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading } = useColleges();

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'name', header: 'College Name', cell: ({ row }) => <span style={{ fontWeight: 500 }}>{row.original.name}</span> },
    { accessorKey: 'shortName', header: 'Abbreviation' },
    {
      accessorKey: 'createdAt',
      header: 'Added On',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Colleges</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage university colleges and schools.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} style={createBtnStyle}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Add College
        </button>
      </div>

      {isLoading ? <DataTableSkeleton columns={3} rows={6} /> : (
        <DataTable columns={columns} data={data?.data || []} />
      )}

      {isModalOpen && <CreateCollegeModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

// Shared styles
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalStyle: React.CSSProperties = { backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' };
const modalHeader: React.CSSProperties = { padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtnStyle: React.CSSProperties = { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const formGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 500, color: 'var(--text)' };
const inputStyle: React.CSSProperties = { padding: '10px 12px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none', width: '100%' };
const cancelBtnStyle: React.CSSProperties = { padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 };
const submitBtnStyle: React.CSSProperties = { padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' };
const createBtnStyle: React.CSSProperties = { padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' };
