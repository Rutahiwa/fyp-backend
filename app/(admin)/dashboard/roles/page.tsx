'use client';

import { useState } from 'react';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole, usePermissions } from './query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { DataTableSkeleton } from '@/components/admin/ui/DataTableSkeleton';
import { ColumnDef } from '@tanstack/react-table';
import { X, Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// ─── Role Modal (create + edit) ────────────────────────────────────────────────
function RoleModal({ onClose, editingRole }: { onClose: () => void; editingRole?: any }) {
  const isEditing = !!editingRole;
  const [name, setName] = useState(editingRole?.name || '');
  const [description, setDescription] = useState(editingRole?.description || '');
  const [selectedPerms, setSelectedPerms] = useState<string[]>(editingRole?.permissions?.map((p: any) => p.id || p) || []);

  const { data: permsData } = usePermissions();
  const { mutate: createRole, isPending: creating } = useCreateRole();
  const { mutate: updateRole, isPending: updating } = useUpdateRole();
  const isPending = creating || updating;

  const permissions: any[] = permsData?.data || [];

  // Group permissions by resource prefix (e.g., "users:read" → "users")
  const grouped = permissions.reduce((acc: Record<string, any[]>, perm: any) => {
    const group = perm.name?.split(':')[0] || 'general';
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {});

  const togglePerm = (permId: string) => {
    setSelectedPerms(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error('Role name is required');

    const payload = { name, description, permissions: selectedPerms };

    if (isEditing) {
      updateRole({ id: editingRole.id, data: payload }, {
        onSuccess: () => { toast.success('Role updated'); onClose(); },
        onError: (err: any) => toast.error(err.message || 'Update failed'),
      });
    } else {
      createRole(payload, {
        onSuccess: () => { toast.success('Role created'); onClose(); },
        onError: (err: any) => toast.error(err.message || 'Create failed'),
      });
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
            {isEditing ? 'Edit Role' : 'Create Role'}
          </h2>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={fGroup}>
            <label style={lStyle}>Role Name</label>
            <input style={iStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. lecturer, class_rep" required />
          </div>

          <div style={fGroup}>
            <label style={lStyle}>Description</label>
            <input style={iStyle} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of this role..." />
          </div>

          {/* Permission Checkboxes */}
          {Object.keys(grouped).length > 0 && (
            <div style={fGroup}>
              <label style={lStyle}>Permissions</label>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                {Object.entries(grouped).map(([group, perms]) => (
                  <div key={group}>
                    <div style={{ padding: '8px 12px', backgroundColor: 'var(--surface-2)', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {group}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                      {perms.map((perm: any) => (
                        <label
                          key={perm.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px', color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPerms.includes(perm.id)}
                            onChange={() => togglePerm(perm.id)}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                          {perm.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedPerms.length} permission(s) selected</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={isPending} style={submitBtnStyle}>
              {isPending && <Loader2 size={14} style={{ marginRight: '6px' }} />}
              {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Roles Page ─────────────────────────────────────────────────────────────────
export default function RolesPage() {
  const { data, isLoading } = useRoles();
  const { mutate: deleteRole } = useDeleteRole();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleDelete = (role: any) => {
    if (!confirm(`Delete the "${role.name}" role? This cannot be undone.`)) return;
    deleteRole(role.id, {
      onSuccess: () => toast.success('Role deleted'),
      onError: (err: any) => toast.error(err.message || 'Delete failed'),
    });
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => <span style={{ fontWeight: 600, color: 'var(--text)' }}>{row.original.name}</span>
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <span style={{ color: 'var(--text-muted)' }}>{row.original.description || '—'}</span>
    },
    {
      accessorKey: 'usersCount',
      header: 'Assigned Users',
      cell: ({ row }) => row.original.usersCount ?? '—'
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => {
        const count = row.original.permissions?.length ?? 0;
        return <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{count} permission{count !== 1 ? 's' : ''}</span>;
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
            <button onClick={() => handleEdit(role)} style={actionBtnStyle} title="Edit Role">
              <Pencil size={15} color="var(--info)" />
            </button>
            <button onClick={() => handleDelete(role)} style={actionBtnStyle} title="Delete Role">
              <Trash2 size={15} color="var(--danger)" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Roles & Permissions</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Define RBAC roles and their system access.</p>
        </div>
        <button onClick={handleCreate} style={createBtnStyle}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Create Role
        </button>
      </div>

      {isLoading ? <DataTableSkeleton columns={5} rows={5} /> : (
        <DataTable columns={columns} data={data?.data || []} />
      )}

      {isModalOpen && (
        <RoleModal onClose={() => { setIsModalOpen(false); setEditingRole(null); }} editingRole={editingRole} />
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────────
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalStyle: React.CSSProperties = { backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' };
const modalHeaderStyle: React.CSSProperties = { padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtnStyle: React.CSSProperties = { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const fGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const lStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 500, color: 'var(--text)' };
const iStyle: React.CSSProperties = { padding: '10px 12px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' };
const cancelBtnStyle: React.CSSProperties = { padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 };
const submitBtnStyle: React.CSSProperties = { padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' };
const createBtnStyle: React.CSSProperties = { padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' };
const actionBtnStyle: React.CSSProperties = { backgroundColor: 'transparent', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
