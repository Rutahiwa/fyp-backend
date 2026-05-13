'use client';

import { useState } from 'react';
import { useStories, useDeleteStory, useCreateStory } from './query';
import { DataTable } from '@/components/admin/ui/DataTable';
import { DataTableSkeleton } from '@/components/admin/ui/DataTableSkeleton';
import { storiesColumns } from '@/components/admin/stories/StoriesColumns';
import { CreateStoryModal } from '@/components/admin/stories/CreateStoryModal';
import { toast } from 'sonner';

export default function StoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, isError } = useStories();
  const { mutate: deleteStory } = useDeleteStory();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      deleteStory(id, {
        onSuccess: () => toast.success('Story deleted')
      });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text)' }}>Stories</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage short-lived image content for the mobile app.</p>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} style={styles.createBtn}>
          + Upload Story
        </button>
      </div>

      {isLoading ? (
        <DataTableSkeleton columns={4} rows={6} />
      ) : isError ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--danger)' }}>
          Failed to load stories.
        </div>
      ) : (
        <DataTable
          columns={storiesColumns({ onDelete: handleDelete })}
          data={data?.data || []}
        />
      )}

      {isModalOpen && (
        <CreateStoryModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  createBtn: {
    padding: '10px 16px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  }
};
