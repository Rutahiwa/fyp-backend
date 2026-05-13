'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateAnnouncement } from '@/app/(admin)/dashboard/announcements/query';
import { useCategories } from '@/app/(admin)/dashboard/announcements/query';
import { toast } from 'sonner';

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const { mutate: createAnnouncement, isPending } = useCreateAnnouncement();
  const { data: categories } = useCategories();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('ALL');
  const [categoryId, setCategoryId] = useState('');
  
  // Expiry Date (default +7 days)
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || content === '<p></p>') {
      return toast.error('Title and content are required.');
    }

    createAnnouncement(
      {
        title,
        content,
        type: 'GENERAL',
        status: 'PUBLISHED',
        categoryId: categoryId || undefined,
        audiences: [{ targetType }],
      },
      {
        onSuccess: () => {
          toast.success('Announcement created successfully');
          router.push('/dashboard/announcements');
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to create announcement');
        }
      }
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create Announcement</h1>
      <p style={styles.subtitle}>Draft and publish a new announcement.</p>
      
      <form onSubmit={handleSubmit} style={styles.formContainer}>
        <div style={styles.mainCol}>
          <div style={styles.card}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                required
                placeholder="Important Notice..."
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ ...styles.input, minHeight: '220px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                required
                placeholder="Announcement body..."
              />
            </div>
          </div>
        </div>

        <div style={styles.sideCol}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Settings</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Target Audience</label>
              <select 
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                style={styles.select}
              >
                <option value="ALL">All Users (Global)</option>
                <option value="COLLEGE">Specific College</option>
                <option value="PROGRAMME">Specific Programme</option>
                <option value="ROLE">Specific Role</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <select 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={styles.select}
              >
                <option value="">None (General)</option>
                {categories?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Expires At</label>
              <input 
                type="datetime-local" 
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                style={styles.input}
              />
            </div>

            <hr style={styles.hr} />

            <button type="submit" disabled={isPending} style={styles.submitBtn}>
              {isPending ? 'Publishing...' : 'Publish Announcement'}
            </button>
            <button 
              type="button" 
              onClick={() => router.back()} 
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    margin: '0 0 8px 0',
    color: 'var(--text)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: '0 0 24px 0',
  },
  formContainer: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  mainCol: {
    flex: 1,
    minWidth: 0,
  },
  sideCol: {
    width: '320px',
    flexShrink: 0,
  },
  card: {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    margin: 0,
    color: 'var(--text)',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text)',
  },
  input: {
    padding: '10px 12px',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
  },
  hr: {
    border: 'none',
    borderTop: '1px solid var(--border)',
    margin: '8px 0',
  },
  submitBtn: {
    padding: '12px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '12px',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  }
};
