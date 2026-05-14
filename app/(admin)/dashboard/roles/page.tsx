'use client';

import { useState } from 'react';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole, usePermissions } from './query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { DataTableSkeleton } from '@/components/admin/ui/DataTableSkeleton';
import { ColumnDef } from '@tanstack/react-table';
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';
import { X, Plus, Loader2, Pencil, Trash2, ShieldAlert, Key, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Configuration for grouping permissions in the UI
 */
const PERMISSION_GROUPS = [
  {
    id: 'users',
    label: '👥 Users',
    permissions: ['user.create', 'user.read', 'user.update', 'user.delete'],
  },
  {
    id: 'roles',
    label: '🔐 Roles & Permissions',
    permissions: ['role.create', 'role.read', 'role.update', 'role.delete', 'permission.read'],
  },
  {
    id: 'platform',
    label: '🏫 Platform',
    permissions: ['college.read', 'college.manage', 'programme.manage', 'academic_year.manage', 'assignment.manage'],
  },
  {
    id: 'announcements',
    label: '📢 Announcements',
    permissions: ['announcement.create', 'announcement.update', 'announcement.delete', 'announcement.pin'],
  },
  {
    id: 'events',
    label: '📅 Events',
    permissions: ['event.create', 'event.update', 'event.delete'],
  },
  {
    id: 'stories',
    label: '📖 Stories',
    permissions: ['story.create', 'story.delete'],
  },
  {
    id: 'lostfound',
    label: '🔍 Lost & Found',
    permissions: ['lostfound.moderate'],
  },
  {
    id: 'feedback',
    label: '💬 Feedback',
    permissions: ['feedback.submit', 'feedback.manage'],
  },
  {
    id: 'posts_groups',
    label: '🗂️ Posts & Groups',
    permissions: ['post.create', 'post.update', 'post.delete', 'group.manage'],
  },
  {
    id: 'audit',
    label: '📋 Audit',
    permissions: ['audit.read'],
  }
];

function formatPermName(raw: string) {
  const [resource, action] = raw.split('.');
  if (!action) return raw;
  const aCap = action.charAt(0).toUpperCase() + action.slice(1);
  const rCap = resource.charAt(0).toUpperCase() + resource.slice(1) + (resource.endsWith('s') ? '' : 's');
  
  if (['read', 'create', 'update', 'delete', 'manage', 'moderate', 'submit', 'pin'].includes(action)) {
     if (action === 'submit' && resource === 'feedback') return 'Submit Feedback';
     if (action === 'manage' && resource === 'feedback') return 'Manage Feedback';
     if (action === 'read' && resource === 'audit') return 'Read Audit Logs';
     if (action === 'moderate' && resource === 'lostfound') return 'Moderate Lost & Found';
     if (action === 'read' && resource === 'permission') return 'Read Permissions';
     return `${aCap} ${rCap}`;
  }
  return raw;
}

// ─── Side Panel (Create + Edit) ────────────────────────────────────────────────
function RoleSidePanel({ onClose, editingRole }: { onClose: () => void; editingRole?: any }) {
  const isEditing = !!editingRole;
  const [name, setName] = useState(editingRole?.name || '');
  const [description, setDescription] = useState(editingRole?.description || '');
  
  // Initialize from the rich API response that we fixed
  const [selectedPerms, setSelectedPerms] = useState<string[]>(
    editingRole?.permissions?.map((p: any) => p.id || p) || []
  );

  const { data: permsData } = usePermissions();
  const { mutate: createRole, isPending: creating } = useCreateRole();
  const { mutate: updateRole, isPending: updating } = useUpdateRole();
  const isPending = creating || updating;

  const allBackendPerms: any[] = permsData?.data || [];

  const handleToggleGroup = (groupId: string, groupPermNames: string[]) => {
    // Find matching backend perm IDs for these names
    const groupPermIds = allBackendPerms
      .filter(p => groupPermNames.includes(p.name))
      .map(p => p.id);
      
    const isAllSelected = groupPermIds.every(id => selectedPerms.includes(id));
    
    if (isAllSelected) {
      // Unselect all in this group
      setSelectedPerms(prev => prev.filter(id => !groupPermIds.includes(id)));
    } else {
      // Select all in this group
      setSelectedPerms(prev => Array.from(new Set([...prev, ...groupPermIds])));
    }
  };

  const toggleSinglePerm = (permId: string) => {
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

  // Block editing of system role basics
  const isSystemEditing = isEditing && (editingRole.name === 'admin' || editingRole.name === 'super-admin');

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={sidePanelStyle} className="slide-in-right">
        <div style={panelHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--text)' }}>
            {isEditing ? 'Edit Role' : 'Create Role'}
          </h2>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={panelContentStyle}>
          <div style={fGroup}>
            <label style={lStyle}>Role Name</label>
            <input 
              style={iStyle} 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. lecturer" 
              required 
              disabled={isSystemEditing}
              title={isSystemEditing ? "System role names cannot be changed" : ""}
            />
          </div>

          <div style={fGroup}>
            <label style={lStyle}>Description</label>
            <textarea 
              style={{ ...iStyle, resize: 'vertical', minHeight: '80px' }} 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Brief description..."
              disabled={isSystemEditing}
              title={isSystemEditing ? "System role descriptions cannot be changed" : ""}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={lStyle}>Permissions</label>
              <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
                {selectedPerms.length} selected
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {PERMISSION_GROUPS.map(group => {
                const groupBackendPerms = allBackendPerms.filter(p => group.permissions.includes(p.name));
                if (groupBackendPerms.length === 0) return null;

                const selectedInGroup = groupBackendPerms.filter(p => selectedPerms.includes(p.id));
                const isAllSelected = selectedInGroup.length === groupBackendPerms.length;
                const isSomeSelected = selectedInGroup.length > 0 && !isAllSelected;

                return (
                  <div key={group.id} style={groupCardStyle}>
                    <div style={groupHeaderStyle}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{group.label}</span>
                      <button 
                        type="button" 
                        onClick={() => handleToggleGroup(group.id, group.permissions)}
                        style={selectAllBtnStyle}
                      >
                        {isAllSelected ? <CheckSquare size={16} color="var(--primary)" /> : 
                         isSomeSelected ? <Square size={16} fill="var(--primary)" color="var(--primary)" opacity={0.5} /> : 
                         <Square size={16} color="var(--text-muted)" />}
                        <span style={{ marginLeft: '6px', fontSize: '12px' }}>
                          {isAllSelected ? 'Deselect All' : 'Select All'}
                        </span>
                      </button>
                    </div>
                    
                    <div style={permsGridStyle}>
                      {groupBackendPerms.map(perm => {
                        const isChecked = selectedPerms.includes(perm.id);
                        return (
                          <label key={perm.id} style={{ ...permLabelStyle, ...(isChecked ? permLabelSelectedStyle : {}) }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSinglePerm(perm.id)}
                              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            {formatPermName(perm.name)}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </form>
        <div style={panelFooterStyle}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button onClick={handleSubmit} type="button" disabled={isPending} style={submitBtnStyle}>
            {isPending && <Loader2 size={16} className="animate-spin" style={{ marginRight: '8px' }} />}
            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </>
  );
}

// ─── Roles Page ─────────────────────────────────────────────────────────────────
export default function RolesPage() {
  const { data, isLoading } = useRoles();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const roles: any[] = data?.data || [];
  const totalPermissions = roles.reduce((sum: number, r: any) => sum + (r.permissions?.length ?? 0), 0);

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleDelete = (role: any) => setDeleteTarget(role);

  // Helper to map raw permission names to their UI group label
  const getGroupBadgeForPerm = (permName: string) => {
    const group = PERMISSION_GROUPS.find(g => g.permissions.includes(permName));
    return group?.label || 'Other';
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
      cell: ({ row }) => row.original.usersCount ?? '0'
    },
    {
      accessorKey: 'permissions',
      header: 'Access Level',
      cell: ({ row }) => {
        const perms: any[] = row.original.permissions || [];
        if (perms.length === 0) return <span style={{ color: 'var(--text-muted)' }}>No permissions</span>;
        
        // Find unique groups these permissions belong to
        const activeGroups = Array.from(new Set(perms.map(p => getGroupBadgeForPerm(p.name || ''))));
        
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {activeGroups.slice(0, 3).map((g, idx) => (
              <span key={idx} style={badgeStyle}>{g}</span>
            ))}
            {activeGroups.length > 3 && (
              <span style={badgeCountStyle}>+{activeGroups.length - 3}</span>
            )}
          </div>
        );
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const role = row.original;
        const isSystem = role.name === 'admin' || role.name === 'super-admin';
        
        return (
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
            {!isSystem ? (
               <>
                 <button onClick={() => handleEdit(role)} style={actionBtnStyle} title="Edit Role">
                   <Pencil size={16} color="var(--info)" />
                 </button>
                 <button onClick={() => handleDelete(role)} style={actionBtnStyle} title="Delete Role">
                   <Trash2 size={16} color="var(--danger)" />
                 </button>
               </>
            ) : (
               <button onClick={() => handleEdit(role)} style={actionBtnStyle} title="View / Edit Permissions">
                 <Pencil size={16} color="var(--text-muted)" />
               </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={statCard}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--primary)20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
            <ShieldAlert size={20} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{isLoading ? '...' : roles.length}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Total Roles</div>
          </div>
        </div>
        <div style={statCard}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#d2992220', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
            <Key size={20} color="#d29922" />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{isLoading ? '...' : totalPermissions}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Total Permissions</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Roles &amp; Permissions</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Define RBAC roles and their system access.</p>
        </div>
        <button onClick={handleCreate} style={createBtnStyle}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Create Role
        </button>
      </div>

      {isLoading ? <DataTableSkeleton columns={5} rows={5} /> : (
        <DataTable columns={columns} data={roles} />
      )}

      {isModalOpen && (
        <RoleSidePanel onClose={() => { setIsModalOpen(false); setEditingRole(null); }} editingRole={editingRole} />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Role"
          message={`Are you sure you want to delete the "${deleteTarget.name}" role? This action cannot be undone.`}
          isPending={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteRole(deleteTarget.id, {
              onSuccess: () => { toast.success('Role deleted'); setDeleteTarget(null); },
              onError: (err: any) => toast.error(err.message || 'Delete failed'),
            });
          }}
        />
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────────
const statCard: React.CSSProperties = { backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center' };
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(2px)' };
const sidePanelStyle: React.CSSProperties = { position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '500px', backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--border)', boxShadow: '-8px 0 32px rgba(0,0,0,0.2)', zIndex: 101, display: 'flex', flexDirection: 'column' };
const panelHeaderStyle: React.CSSProperties = { padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const panelContentStyle: React.CSSProperties = { padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' };
const panelFooterStyle: React.CSSProperties = { padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'var(--bg)' };

const closeBtnStyle: React.CSSProperties = { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' };
const fGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const lStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 500, color: 'var(--text)' };
const iStyle: React.CSSProperties = { padding: '10px 12px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' };

const groupCardStyle: React.CSSProperties = { border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--bg)' };
const groupHeaderStyle: React.CSSProperties = { padding: '12px 16px', backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const selectAllBtnStyle: React.CSSProperties = { background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' };
const permsGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', padding: '12px 16px', gap: '12px' };
const permLabelStyle: React.CSSProperties = { display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text)', padding: '6px', borderRadius: '4px', transition: 'background 0.2s' };
const permLabelSelectedStyle: React.CSSProperties = { backgroundColor: 'var(--surface-2)' };

const badgeStyle: React.CSSProperties = { fontSize: '12px', padding: '4px 8px', backgroundColor: 'var(--surface-2)', color: 'var(--text)', borderRadius: '100px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' };
const badgeCountStyle: React.CSSProperties = { ...badgeStyle, backgroundColor: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)', fontWeight: 600 };

const cancelBtnStyle: React.CSSProperties = { padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 };
const submitBtnStyle: React.CSSProperties = { padding: '10px 20px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' };
const createBtnStyle: React.CSSProperties = { padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' };
const actionBtnStyle: React.CSSProperties = { backgroundColor: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
