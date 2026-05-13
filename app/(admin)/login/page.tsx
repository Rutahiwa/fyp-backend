'use client';

import { useState } from 'react';
import { adminLogin } from '@/app/(admin)/actions/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await adminLogin(email, password);
      if (res.success) {
        toast.success('Logged in successfully');
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>UDSM Connect Admin</h1>
          <p style={styles.subtitle}>Sign in to manage the platform</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              placeholder="admin@udsm.ac.tz"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
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
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
    padding: '12px',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: 600,
    marginTop: '8px',
    transition: 'background-color 0.2s',
  }
};
