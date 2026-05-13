'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAnnouncement, useUpdateAnnouncement } from '../../query';
import { useCategories } from '../../query';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useAnnouncement(id);
  const { data: categories } = useCategories();
  const { mutate: updateAnnouncement, isPending } = useUpdateAnnouncement();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('ALL');
  const [categoryId, setCategoryId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  // Pre-fill form once data loads
  useEffect(() => {
    const ann = data?.data;
    if (!ann) return;
    setTitle(ann.title || '');
    setContent(ann.content || '');
    setTargetType(ann.audiences?.[0]?.targetType || ann.targetType || 'ALL');
    setCategoryId(ann.categoryId || '');
    setStatus(ann.status || 'PUBLISHED');
    if (ann.expiresAt) setExpiresAt(new Date(ann.expiresAt).toISOString().slice(0, 16));
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return toast.error('Title and content are required');

    updateAnnouncement(
      {
        id,
        data: {
          title,
          content,
          status,
          categoryId: categoryId || undefined,
          audiences: [{ targetType }],
        },
      },
      {
        onSuccess: () => {
          toast.success('Announcement updated');
          router.push('/dashboard/announcements');
        },
        onError: (err: any) => toast.error(err.message || 'Update failed'),
      }
    );
  };

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', padding: '24px' }}>
      <Loader2 size={18} /> Loading announcement...
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px' }}>
      <Link href="/dashboard/announcements" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Announcements
      </Link>

      <h1 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text)' }}>Edit Announcement</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 24px 0' }}>Update the details of an existing announcement.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Main content col */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={cardStyle}>
            <div style={fGroup}>
              <label style={lStyle}>Title</label>
              <input style={iStyle} value={title} onChange={e => setTitle(e.target.value)} required placeholder="Announcement title..." />
            </div>
            <div style={fGroup}>
              <label style={lStyle}>Content</label>
              <textarea
                style={{ ...iStyle, minHeight: '240px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                placeholder="Announcement body..."
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tip: Install Tiptap (pnpm install) for the rich text editor.</span>
            </div>
          </div>
        </div>

        {/* Side settings col */}
        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ ...cardStyle, gap: '16px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>Settings</h3>

            <div style={fGroup}>
              <label style={lStyle}>Status</label>
              <select style={sStyle} value={status} onChange={e => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}>
                <option value="PUBLISHED">Published (Active)</option>
                <option value="DRAFT">Draft (Inactive)</option>
              </select>
            </div>

            <div style={fGroup}>
              <label style={lStyle}>Target Audience</label>
              <select style={sStyle} value={targetType} onChange={e => setTargetType(e.target.value)}>
                <option value="ALL">All Users</option>
                <option value="COLLEGE">Specific College</option>
                <option value="PROGRAMME">Specific Programme</option>
                <option value="ROLE">Specific Role</option>
              </select>
            </div>

            <div style={fGroup}>
              <label style={lStyle}>Category</label>
              <select style={sStyle} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">None (General)</option>
                {categories?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={fGroup}>
              <label style={lStyle}>Expires At</label>
              <input type="datetime-local" style={iStyle} value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

            <button type="submit" disabled={isPending} style={submitBtnStyle}>
              {isPending ? <Loader2 size={14} style={{ marginRight: '6px' }} /> : <Save size={14} style={{ marginRight: '6px' }} />}
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => router.back()} style={cancelBtnStyle}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}

const cardStyle: React.CSSProperties = { backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' };
const fGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const lStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 500, color: 'var(--text)' };
const iStyle: React.CSSProperties = { padding: '10px 12px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' };
const sStyle: React.CSSProperties = { ...iStyle, cursor: 'pointer' };
const submitBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' };
const cancelBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontWeight: 500, cursor: 'pointer', fontSize: '14px' };
