import React from 'react';

export function DataTableSkeleton({ columns = 5, rows = 10 }: { columns?: number; rows?: number }) {
  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={`th-${i}`} style={styles.th}>
                <div style={{ ...styles.skeleton, width: '60%', height: '16px' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={`tr-${i}`} style={styles.tr}>
              {Array.from({ length: columns }).map((_, j) => (
                <td key={`td-${i}-${j}`} style={styles.td}>
                  <div style={{ 
                    ...styles.skeleton, 
                    width: j === 0 ? '80%' : j === columns - 1 ? '40%' : '100%',
                    height: '20px'
                  }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    backgroundColor: 'var(--surface-2)',
  },
  th: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '12px 16px',
  },
  skeleton: {
    backgroundColor: 'var(--surface-h)',
    borderRadius: 'var(--radius-sm)',
    animation: 'pulse 1.5s infinite ease-in-out',
  }
};
