'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateEvent, useEventCategories } from '../query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateEventPage() {
  const router = useRouter();
  const { mutate: createEvent, isPending } = useCreateEvent();
  const { data: categoriesData } = useEventCategories();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !startDateTime || !endDateTime) {
      return toast.error('Title, description, and dates are required');
    }
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      return toast.error('End date must be after start date');
    }

    createEvent(
      {
        title,
        description,
        location: location || undefined,
        locationUrl: locationUrl || undefined,
        categoryId: categoryId || undefined,
        startDateTime: new Date(startDateTime).toISOString(),
        endDateTime: new Date(endDateTime).toISOString(),
        maxAttendees: maxAttendees ? Number(maxAttendees) : undefined,
        status,
      },
      {
        onSuccess: () => {
          toast.success('Event created successfully');
          router.push('/dashboard/events');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to create event'),
      }
    );
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      <Link href="/dashboard/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Events
      </Link>

      <h1 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text)' }}>Create Event</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 24px 0' }}>Schedule a new university or student-organized event.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Main col */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={cardStyle}>
            <div style={fGroup}>
              <label style={lStyle}>Event Title</label>
              <input style={iStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="UDSM Annual Career Fair 2025" required />
            </div>
            <div style={fGroup}>
              <label style={lStyle}>Description</label>
              <textarea
                style={{ ...iStyle, minHeight: '200px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Full event description..."
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={fGroup}>
                <label style={lStyle}>Start Date & Time</label>
                <input type="datetime-local" style={iStyle} value={startDateTime} onChange={e => setStartDateTime(e.target.value)} required />
              </div>
              <div style={fGroup}>
                <label style={lStyle}>End Date & Time</label>
                <input type="datetime-local" style={iStyle} value={endDateTime} onChange={e => setEndDateTime(e.target.value)} required />
              </div>
            </div>
          </div>
        </div>

        {/* Side col */}
        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ ...cardStyle, gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>Event Details</h3>

            <div style={fGroup}>
              <label style={lStyle}>Status</label>
              <select style={sStyle} value={status} onChange={e => setStatus(e.target.value as any)}>
                <option value="PUBLISHED">Publish Now</option>
                <option value="DRAFT">Save as Draft</option>
              </select>
            </div>

            <div style={fGroup}>
              <label style={lStyle}>Category</label>
              <select style={sStyle} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">No Category</option>
                {categoriesData?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={fGroup}>
              <label style={lStyle}>Location</label>
              <input style={iStyle} value={location} onChange={e => setLocation(e.target.value)} placeholder="COICT Hall, Main Campus" />
            </div>

            <div style={fGroup}>
              <label style={lStyle}>Location URL (Maps)</label>
              <input style={iStyle} value={locationUrl} onChange={e => setLocationUrl(e.target.value)} placeholder="https://maps.google.com/..." />
            </div>

            <div style={fGroup}>
              <label style={lStyle}>Max Attendees</label>
              <input type="number" style={iStyle} value={maxAttendees} onChange={e => setMaxAttendees(e.target.value)} placeholder="Leave blank for unlimited" min="1" />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

            <button type="submit" disabled={isPending} style={submitBtnStyle}>
              {isPending && <Loader2 size={14} style={{ marginRight: '6px' }} />}
              {isPending ? 'Creating...' : 'Create Event'}
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
