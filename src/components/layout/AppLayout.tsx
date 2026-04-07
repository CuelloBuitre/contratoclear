import Navbar from './Navbar'

const wrapperStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fafaf8',
  backgroundImage:
    'linear-gradient(#0f0f1a08 1px, transparent 1px), linear-gradient(90deg, #0f0f1a08 1px, transparent 1px)',
  backgroundSize: '48px 48px',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={wrapperStyle}>
      <Navbar variant="app" />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  )
}
