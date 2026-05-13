'use client';

import { use, useState } from 'react';
import { useUser, useUpdateUser } from '../query';
import { useRoles } from '@/app/(admin)/dashboard/roles/query';
import { DataTableSkeleton } from '@/components/admin/ui/DataTableSkeleton';
import { Badge } from '@/components/admin/ui/Badge';
import { ArrowLeft, Save, Loader2, User, ShieldCheck, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useUser(id);
  const { data: rolesData } = useRoles();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const user = data?.data;
  const roles = rolesData?.data || [];

  // Pre-populate role select once user loads
  const currentRoleId = user?.roleId || '';
  const effectiveRoleId = selectedRoleId || currentRoleId;

  const handleRoleChange = () => {
    if (!selectedRoleId || selectedRoleId === currentRoleId) {
      return toast.error('Please select a different role');
    }
    updateUser({ id, data: { roleId: selectedRoleId } }, {
      onSuccess: () => toast.success('User role updated successfully'),
      onError: (err: any) => toast.error(err.message || 'Failed to update role'),
    });
  };

  const handleToggleStatus = () => {
    updateUser({ id, data: { isActive: !user?.isActive } }, {
      onSuccess: () => toast.success(`User ${user?.isActive ? 'deactivated' : 'activated'}`),
      onError: (err: any) => toast.error(err.message || 'Failed to update status'),
    });
  };

  if (isLoading) return <DataTableSkeleton columns={1} rows={6} />;
  if (!user) return <div style={{ color: 'var(--danger)', padding: '24px' }}>User not found.</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Back nav */}
      <Link href="/dashboard/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Users
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: '#fff' }}>
            {user.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text)' }}>{user.fullName}</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{user.email}</div>
          </div>
        </div>
        <Badge variant={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'Active' : 'Deactivated'}</Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Info Card */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}><User size={16} style={{ marginRight: '8px' }} />Profile Details</h3>
          <div style={infoGrid}>
            <InfoRow label="Reg Number" value={user.registrationNumber || 'N/A'} />
            <InfoRow label="College" value={user.college?.name || 'N/A'} />
            <InfoRow label="Programme" value={user.programme?.name || 'N/A'} />
            <InfoRow label="Year of Study" value={user.yearOfStudy ? `Year ${user.yearOfStudy}` : 'N/A'} />
            <InfoRow label="Phone" value={user.phoneNumber || 'N/A'} />
            <InfoRow label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
          </div>
        </div>

        {/* Actions Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Role Management */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}><ShieldCheck size={16} style={{ marginRight: '8px' }} />Role Assignment</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Current Role</label>
                <div style={{ marginTop: '4px' }}>
                  <Badge variant="info">{user.roleName || 'Unknown'}</Badge>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Change Role</label>
                <select
                  style={selectStyle}
                  value={effectiveRoleId}
                  onChange={e => setSelectedRoleId(e.target.value)}
                >
                  <option value="">— Select Role —</option>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleRoleChange}
                disabled={isPending || !selectedRoleId || selectedRoleId === currentRoleId}
                style={{
                  ...primaryBtnStyle,
                  opacity: (!selectedRoleId || selectedRoleId === currentRoleId) ? 0.5 : 1
                }}
              >
                {isPending ? <Loader2 size={14} style={{ marginRight: '6px' }} /> : <Save size={14} style={{ marginRight: '6px' }} />}
                Save Role Change
              </button>
            </div>
          </div>

          {/* Status */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}><Calendar size={16} style={{ marginRight: '8px' }} />Account Status</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              {user.isActive
                ? 'This user can log in and use the platform normally.'
                : 'This account is deactivated. The user cannot log in.'}
            </p>
            <button
              onClick={handleToggleStatus}
              disabled={isPending}
              style={{
                ...primaryBtnStyle,
                backgroundColor: user.isActive ? 'rgba(218, 54, 51, 0.15)' : 'rgba(46, 160, 67, 0.15)',
                color: user.isActive ? '#ff7b72' : '#3fb950',
              }}
            >
              {user.isActive ? 'Deactivate Account' : 'Activate Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: '14px', color: 'var(--text)' }}>{value}</span>
    </div>
  );
}

const cardStyle: React.CSSProperties = { backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' };
const cardTitleStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: '0 0 16px 0' };
const infoGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };
const labelStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 500, color: 'var(--text)' };
const selectStyle: React.CSSProperties = { padding: '10px 12px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none', width: '100%', marginTop: '6px', cursor: 'pointer' };
const primaryBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', width: '100%', fontSize: '14px' };
