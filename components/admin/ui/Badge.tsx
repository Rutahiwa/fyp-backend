import { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: BadgeVariant }) {
  let bgColor = 'var(--surface-2)';
  let color = 'var(--text)';

  switch (variant) {
    case 'success':
      bgColor = 'rgba(46, 160, 67, 0.15)';
      color = '#3fb950';
      break;
    case 'warning':
      bgColor = 'rgba(210, 153, 34, 0.15)';
      color = '#e3b341';
      break;
    case 'danger':
      bgColor = 'rgba(218, 54, 51, 0.15)';
      color = '#ff7b72';
      break;
    case 'info':
      bgColor = 'rgba(56, 139, 253, 0.15)';
      color = '#79c0ff';
      break;
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '99px',
      fontSize: '12px',
      fontWeight: 600,
      backgroundColor: bgColor,
      color: color,
      border: `1px solid ${bgColor}`
    }}>
      {children}
    </span>
  );
}
