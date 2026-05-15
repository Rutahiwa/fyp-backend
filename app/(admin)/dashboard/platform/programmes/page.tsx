'use client';

import { useState } from 'react';
import { useColleges, useDepartments, useProgrammes, useCreateProgramme, useUpdateProgramme, useDeleteProgramme } from '../query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { DataTableSkeleton } from '@/components/admin/ui/DataTableSkeleton';
import { ColumnDef } from '@tanstack/react-table';
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';
import { X, Plus, Loader2, BookOpen, Trash2, AlertTriangle, Edit2 } from 'lucide-react';
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

// ── Create Programme Modal ───────────────────────────────────────────────────
function CreateProgrammeModal({ onClose }: { onClose: () => void }) {
  const [collegeId, setCollegeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [durationYears, setDurationYears] = useState(3);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { mutate: createProgramme, isPending } = useCreateProgramme();
  const { data: colleges } = useColleges();
  const { data: departmentsData, isLoading: isLoadingDepts } = useDepartments(collegeId || undefined);

  const departments: any[] = departmentsData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !departmentId) return toast.error('All fields are required');
    setErrorMsg('');
    createProgramme({ name, code, departmentId, durationYears }, {
      onSuccess: () => { toast.success('Programme added successfully'); onClose(); },
      onError: (err: any) => {
        if (err.message?.toLowerCase().includes('already exists') || err.message?.toLowerCase().includes('conflict') || err.message?.toLowerCase().includes('unique')) {
          setErrorMsg('A programme with this code already exists. Please use a different abbreviation.');
        } else {
          setErrorMsg(err.message || 'Failed to add programme');
        }
      },
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeader}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>Add New Programme</h2>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>
        {errorMsg && (
          <div style={{ margin: '20px 20px 0', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: 'var(--danger)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.4 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={formGroup}>
            <label style={labelStyle}>College</label>
            <select 
              style={selectStyle} 
              value={collegeId} 
              onChange={e => {
                setCollegeId(e.target.value);
                setDepartmentId(''); // Reset department when college changes
              }} 
              required
            >
              <option value="">— Select College —</option>
              {colleges?.data?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.shortName})</option>
              ))}
            </select>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>Department</label>
            <select 
              style={selectStyle} 
              value={departmentId} 
              onChange={e => setDepartmentId(e.target.value)} 
              required
              disabled={!collegeId || isLoadingDepts}
            >
              <option value="">{!collegeId ? 'Select college first' : '— Select Department —'}</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name} ({d.shortName})</option>
              ))}
            </select>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>Programme Name</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Bachelor of Science in Computer Science" required />
          </div>
          
          <div style={formGroup}>
            <label style={labelStyle}>Abbreviation</label>
            <input style={inputStyle} value={code} onChange={e => setCode(e.target.value)} placeholder="BSc CS" required />
          </div>
          
          <div style={formGroup}>
            <label style={labelStyle}>Duration in Years</label>
            <select style={selectStyle} value={durationYears} onChange={e => setDurationYears(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Year{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={isPending} style={submitBtnStyle}>
              {isPending && <Loader2 size={14} style={{ marginRight: '6px', animation: 'spin 1s linear infinite' }} />}
              {isPending ? 'Adding...' : 'Add Programme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Programme Modal ─────────────────────────────────────────────────────
function EditProgrammeModal({ programme, onClose }: { programme: any; onClose: () => void }) {
  const [collegeId, setCollegeId] = useState(programme.collegeId);
  const [departmentId, setDepartmentId] = useState(programme.departmentId);
  const [name, setName] = useState(programme.name);
  const [code, setCode] = useState(programme.code);
  const [durationYears, setDurationYears] = useState(programme.durationYears);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { mutate: updateProgramme, isPending } = useUpdateProgramme();
  const { data: colleges } = useColleges();
  const { data: departmentsData, isLoading: isLoadingDepts } = useDepartments(collegeId || undefined);

  const departments: any[] = departmentsData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !departmentId) return toast.error('All fields are required');
    setErrorMsg('');
    updateProgramme({ id: programme.id, data: { name, code, departmentId, durationYears } }, {
      onSuccess: () => { toast.success('Programme updated successfully'); onClose(); },
      onError: (err: any) => {
        if (err.message?.toLowerCase().includes('already exists') || err.message?.toLowerCase().includes('conflict') || err.message?.toLowerCase().includes('unique')) {
          setErrorMsg('A programme with this code already exists. Please use a different abbreviation.');
        } else {
          setErrorMsg(err.message || 'Failed to update programme');
        }
      },
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeader}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>Edit Programme</h2>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>
        {errorMsg && (
          <div style={{ margin: '20px 20px 0', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: 'var(--danger)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.4 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={formGroup}>
            <label style={labelStyle}>College</label>
            <select 
              style={selectStyle} 
              value={collegeId} 
              onChange={e => {
                setCollegeId(e.target.value);
                setDepartmentId(''); // Reset department when college changes
              }} 
              required
            >
              <option value="">— Select College —</option>
              {colleges?.data?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.shortName})</option>
              ))}
            </select>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>Department</label>
            <select 
              style={selectStyle} 
              value={departmentId} 
              onChange={e => setDepartmentId(e.target.value)} 
              required
              disabled={!collegeId || isLoadingDepts}
            >
              <option value="">{!collegeId ? 'Select college first' : '— Select Department —'}</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name} ({d.shortName})</option>
              ))}
            </select>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>Programme Name</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
          </div>
          
          <div style={formGroup}>
            <label style={labelStyle}>Abbreviation</label>
            <input style={inputStyle} value={code} onChange={e => setCode(e.target.value)} required />
          </div>
          
          <div style={formGroup}>
            <label style={labelStyle}>Duration in Years</label>
            <select style={selectStyle} value={durationYears} onChange={e => setDurationYears(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Year{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={isPending} style={submitBtnStyle}>
              {isPending && <Loader2 size={14} style={{ marginRight: '6px', animation: 'spin 1s linear infinite' }} />}
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Programmes Page ───────────────────────────────────────────────────────────
export default function ProgrammesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const { data, isLoading } = useProgrammes();
  const { mutate: deleteProgramme, isPending: isDeleting } = useDeleteProgramme();

  const programmes: any[] = data?.data || [];

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'name', header: 'Programme Name', cell: ({ row }) => <span style={{ fontWeight: 500 }}>{row.original.name}</span> },
    { accessorKey: 'code', header: 'Abbreviation' },
    { accessorKey: 'durationYears', header: 'Duration', cell: ({ row }) => `${row.original.durationYears} years` },
    { accessorKey: 'departmentShortName', header: 'Department', cell: ({ row }) => row.original.departmentShortName || '-' },
    { accessorKey: 'collegeShortName', header: 'College', cell: ({ row }) => row.original.collegeShortName || '-' },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => setEditTarget(row.original)}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Edit Programme"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(row.original)}
            style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Delete Programme"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Programmes</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage academic degree programmes.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} style={createBtnStyle}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Add Programme
        </button>
      </div>

      {isLoading ? <DataTableSkeleton columns={6} rows={8} /> : (
        <DataTable columns={columns} data={programmes} />
      )}

      {isModalOpen && <CreateProgrammeModal onClose={() => setIsModalOpen(false)} />}
      {editTarget && <EditProgrammeModal programme={editTarget} onClose={() => setEditTarget(null)} />}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Programme"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          isPending={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteProgramme(deleteTarget.id, {
              onSuccess: () => { toast.success('Programme deleted'); setDeleteTarget(null); },
              onError: (err: any) => toast.error(err.message || 'Failed to delete programme'),
            });
          }}
        />
      )}
    </div>
  );
}

// Shared styles
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalStyle: React.CSSProperties = { backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' };
const modalHeader: React.CSSProperties = { padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtnStyle: React.CSSProperties = { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const formGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 500, color: 'var(--text)' };
const inputStyle: React.CSSProperties = { padding: '10px 12px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer', appearance: 'auto' };
const cancelBtnStyle: React.CSSProperties = { padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 };
const submitBtnStyle: React.CSSProperties = { padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' };
const createBtnStyle: React.CSSProperties = { padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' };
