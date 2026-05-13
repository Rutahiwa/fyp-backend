'use client';

import { useState } from 'react';
import { useLecturerAssignments, useCreateLecturerAssignment, useCrAssignments, useCreateCrAssignment } from './query';
import { useUsers } from '@/app/(admin)/dashboard/users/query';
import { useProgrammes } from '@/app/(admin)/dashboard/platform/query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { DataTableSkeleton } from '@/components/admin/ui/DataTableSkeleton';
import { ColumnDef } from '@tanstack/react-table';
import { X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'lecturers' | 'classreps';

function AssignLecturerModal({ onClose }: { onClose: () => void }) {
  const [userId, setUserId] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const { mutate: assign, isPending } = useCreateLecturerAssignment();
  const { data: usersData } = useUsers({ pageSize: 100 });
  const { data: programmesData } = useProgrammes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !programmeId) return toast.error('All fields are required');
    assign({ userId, programmeId }, {
      onSuccess: () => { toast.success('Lecturer assigned'); onClose(); },
      onError: (err: any) => toast.error(err.message || 'Assignment failed'),
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>Assign Lecturer</h2>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={fGroup}>
            <label style={lStyle}>Select Lecturer (User)</label>
            <select style={sStyle} value={userId} onChange={e => setUserId(e.target.value)} required>
              <option value="">— Select User —</option>
              {usersData?.data?.map((u: any) => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
              ))}
            </select>
          </div>
          <div style={fGroup}>
            <label style={lStyle}>Assign to Programme</label>
            <select style={sStyle} value={programmeId} onChange={e => setProgrammeId(e.target.value)} required>
              <option value="">— Select Programme —</option>
              {programmesData?.data?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={isPending} style={submitBtnStyle}>
              {isPending && <Loader2 size={14} style={{ marginRight: '6px' }} />}
              {isPending ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignCrModal({ onClose }: { onClose: () => void }) {
  const [userId, setUserId] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const { mutate: assign, isPending } = useCreateCrAssignment();
  const { data: usersData } = useUsers({ pageSize: 100 });
  const { data: programmesData } = useProgrammes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !programmeId) return toast.error('All fields are required');
    assign({ userId, programmeId, yearOfStudy }, {
      onSuccess: () => { toast.success('Class Rep assigned'); onClose(); },
      onError: (err: any) => toast.error(err.message || 'Assignment failed'),
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>Assign Class Rep</h2>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={fGroup}>
            <label style={lStyle}>Select Student (User)</label>
            <select style={sStyle} value={userId} onChange={e => setUserId(e.target.value)} required>
              <option value="">— Select User —</option>
              {usersData?.data?.map((u: any) => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.registrationNumber || u.email})</option>
              ))}
            </select>
          </div>
          <div style={fGroup}>
            <label style={lStyle}>Programme</label>
            <select style={sStyle} value={programmeId} onChange={e => setProgrammeId(e.target.value)} required>
              <option value="">— Select Programme —</option>
              {programmesData?.data?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={fGroup}>
            <label style={lStyle}>Year of Study</label>
            <select style={sStyle} value={yearOfStudy} onChange={e => setYearOfStudy(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={isPending} style={submitBtnStyle}>
              {isPending && <Loader2 size={14} style={{ marginRight: '6px' }} />}
              {isPending ? 'Assigning...' : 'Assign CR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  const [tab, setTab] = useState<Tab>('lecturers');
  const [isLecturerModalOpen, setIsLecturerModalOpen] = useState(false);
  const [isCrModalOpen, setIsCrModalOpen] = useState(false);

  const { data: lecturers, isLoading: lecturersLoading } = useLecturerAssignments();
  const { data: crs, isLoading: crsLoading } = useCrAssignments();

  const lecturerColumns: ColumnDef<any>[] = [
    { accessorKey: 'user.fullName', header: 'Lecturer', cell: ({ row }) => <span style={{ fontWeight: 500 }}>{row.original.user?.fullName || '—'}</span> },
    { accessorKey: 'user.email', header: 'Email', cell: ({ row }) => row.original.user?.email || '—' },
    { accessorKey: 'programme.name', header: 'Programme', cell: ({ row }) => row.original.programme?.name || '—' },
    { accessorKey: 'createdAt', header: 'Assigned On', cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
  ];

  const crColumns: ColumnDef<any>[] = [
    { accessorKey: 'user.fullName', header: 'Class Rep', cell: ({ row }) => <span style={{ fontWeight: 500 }}>{row.original.user?.fullName || '—'}</span> },
    { accessorKey: 'user.registrationNumber', header: 'Reg No.', cell: ({ row }) => row.original.user?.registrationNumber || '—' },
    { accessorKey: 'programme.name', header: 'Programme', cell: ({ row }) => row.original.programme?.name || '—' },
    { accessorKey: 'yearOfStudy', header: 'Year', cell: ({ row }) => `Year ${row.original.yearOfStudy}` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Assignments</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Assign lecturers to programmes and class reps to cohorts.</p>
        </div>
        <button
          onClick={() => tab === 'lecturers' ? setIsLecturerModalOpen(true) : setIsCrModalOpen(true)}
          style={createBtnStyle}
        >
          <Plus size={16} style={{ marginRight: '6px' }} />
          {tab === 'lecturers' ? 'Assign Lecturer' : 'Assign Class Rep'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        {(['lecturers', 'classreps'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--primary-h)' : '2px solid transparent',
              color: tab === t ? 'var(--primary-h)' : 'var(--text-muted)',
              fontWeight: tab === t ? 600 : 400,
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '-1px',
            }}
          >
            {t === 'lecturers' ? 'Lecturers' : 'Class Reps'}
          </button>
        ))}
      </div>

      {tab === 'lecturers' ? (
        lecturersLoading ? <DataTableSkeleton columns={4} rows={6} /> :
        <DataTable columns={lecturerColumns} data={lecturers?.data || []} />
      ) : (
        crsLoading ? <DataTableSkeleton columns={4} rows={6} /> :
        <DataTable columns={crColumns} data={crs?.data || []} />
      )}

      {isLecturerModalOpen && <AssignLecturerModal onClose={() => setIsLecturerModalOpen(false)} />}
      {isCrModalOpen && <AssignCrModal onClose={() => setIsCrModalOpen(false)} />}
    </div>
  );
}

const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalStyle: React.CSSProperties = { backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' };
const modalHeaderStyle: React.CSSProperties = { padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtnStyle: React.CSSProperties = { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const fGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const lStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 500, color: 'var(--text)' };
const sStyle: React.CSSProperties = { padding: '10px 12px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none', width: '100%', cursor: 'pointer' };
const cancelBtnStyle: React.CSSProperties = { padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 };
const submitBtnStyle: React.CSSProperties = { padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' };
const createBtnStyle: React.CSSProperties = { padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' };
