'use client';

import { useState } from 'react';
import { useColleges, useDepartments, useCreateDepartment, useDeleteDepartment } from '../query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { DataTableSkeleton } from '@/components/admin/ui/DataTableSkeleton';
import { ColumnDef } from '@tanstack/react-table';
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';
import { X, Plus, Loader2, Building, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: any; color: string }) {
  return (
    <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', borderLeft: `3px solid ${color}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
      </div>
    </div>
  );
}

// ── Create Department Modal ───────────────────────────────────────────────────
function CreateDepartmentModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const { data: collegesData, isLoading: isLoadingColleges } = useColleges();
  const { mutate: createDepartment, isPending } = useCreateDepartment();

  const colleges: any[] = collegesData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !shortName || !collegeId) return toast.error('All fields are required');
    createDepartment({ name, shortName, collegeId }, {
      onSuccess: () => { toast.success('Department added successfully'); onClose(); },
      onError: (err: any) => toast.error(err.message || 'Failed to add department'),
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeader}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>Add New Department</h2>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={formGroup}>
            <label style={labelStyle}>Select College</label>
            <select 
              style={inputStyle} 
              value={collegeId} 
              onChange={e => setCollegeId(e.target.value)} 
              required
              disabled={isLoadingColleges}
            >
              <option value="" disabled>Select a college...</option>
              {colleges.map((col) => (
                <option key={col.id} value={col.id}>{col.name} ({col.shortName})</option>
              ))}
            </select>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>Full Department Name</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Department of Computer Science" required />
          </div>
          
          <div style={formGroup}>
            <label style={labelStyle}>Abbreviation</label>
            <input style={inputStyle} value={shortName} onChange={e => setShortName(e.target.value)} placeholder="CSE" required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={isPending || isLoadingColleges} style={submitBtnStyle}>
              {isPending && <Loader2 size={14} style={{ marginRight: '6px', animation: 'spin 1s linear infinite' }} />}
              {isPending ? 'Adding...' : 'Add Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Departments Page ──────────────────────────────────────────────────────────
export default function DepartmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const { data, isLoading } = useDepartments();
  const { mutate: deleteDepartment, isPending: isDeleting } = useDeleteDepartment();

  const departments: any[] = data?.data || [];

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Department Name',
      cell: ({ row }) => <span style={{ fontWeight: 500 }}>{row.original.name}</span>,
    },
    { accessorKey: 'shortName', header: 'Abbreviation' },
    { accessorKey: 'collegeName', header: 'College' },
    {
      accessorKey: 'createdAt',
      header: 'Added On',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setDeleteTarget(row.original)}
            style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Delete Department"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={<Building size={20} color="var(--primary)" />} label="Total Departments" value={isLoading ? '...' : departments.length} color="var(--primary)" />
        <StatCard icon={<Building size={20} color="#d29922" />} label="Active Since" value={isLoading ? '...' : (departments[0] ? new Date(departments[0].createdAt).getFullYear() : '—')} color="#d29922" />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Departments</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage academic departments under colleges.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} style={createBtnStyle}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Add Department
        </button>
      </div>

      {isLoading ? <DataTableSkeleton columns={5} rows={6} /> : (
        <DataTable columns={columns} data={departments} />
      )}

      {isModalOpen && <CreateDepartmentModal onClose={() => setIsModalOpen(false)} />}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Department"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          isPending={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteDepartment(deleteTarget.id, {
              onSuccess: () => { toast.success('Department deleted'); setDeleteTarget(null); },
              onError: (err: any) => toast.error(err.message || 'Failed to delete department'),
            });
          }}
        />
      )}
    </div>
  );
}

// Shared styles
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalStyle: React.CSSProperties = { backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' };
const modalHeader: React.CSSProperties = { padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtnStyle: React.CSSProperties = { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const formGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 500, color: 'var(--text)' };
const inputStyle: React.CSSProperties = { padding: '10px 12px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none', width: '100%' };
const cancelBtnStyle: React.CSSProperties = { padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 };
const submitBtnStyle: React.CSSProperties = { padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' };
const createBtnStyle: React.CSSProperties = { padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' };
