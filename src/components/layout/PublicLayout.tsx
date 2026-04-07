import Navbar from './Navbar'
import Footer from './Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
