import { Component, type ReactNode } from 'react'
import HUD from './components/HUD'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: '#00ff41', background: '#000500', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
          <h2 style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>[!] CORE_ERROR_DETECTED</h2>
          <p style={{ color: '#008f11', marginTop: 8 }}>CRITICAL: System uplink disrupted. Restore required.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 24, padding: '12px 32px', background: 'rgba(0, 255, 65, 0.1)', border: '1px solid #00ff41', borderRadius: 4, color: '#00ff41', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold', textShadow: '0 0 5px rgba(0, 255, 65, 0.5)' }}>
            RELOAD_SYSTEM
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  return (
    <div className="w-screen h-screen">
      <ErrorBoundary>
        <HUD />
      </ErrorBoundary>
    </div>
  )
}

export default App
