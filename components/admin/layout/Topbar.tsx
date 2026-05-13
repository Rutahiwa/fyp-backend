'use client';

import { usePathname } from 'next/navigation';

export function Topbar() {
  const pathname = usePathname();
  
  // Create a simple breadcrumb from the pathname
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumb = segments.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ');

  return (
    <header style={styles.topbar}>
      <div style={styles.breadcrumb}>
        {breadcrumb}
      </div>
      
      <div style={styles.actions}>
        <div style={styles.avatar}>
          A
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    height: '64px',
    backgroundColor: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'fixed',
    top: 0,
    right: 0,
    left: 'var(--sidebar-w)',
    zIndex: 10,
  },
  breadcrumb: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
  }
};
