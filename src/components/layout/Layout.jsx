import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞', path: '/' },
  { id: 'commerce', label: 'Commerce', icon: '🛒', path: '/commerce' },
  { id: 'ordonnancement', label: 'Ordonnancement', icon: '⚙️', path: '/ordonnancement' },
  { id: 'production', label: 'Production', icon: '⚙️', path: '/production' },
  { id: 'logistique', label: 'Logistique', icon: '🚚', path: '/logistique' },
  { id: 'stock', label: 'Stock', icon: '📦', path: '/stock' },
  { id: 'qualite', label: 'Qualité', icon: '✓', path: '/qualite' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧', path: '/maintenance' },
  { id: 'pilotage', label: 'Pilotage', icon: '📊', path: '/pilotage' },
  { id: 'administration', label: 'Admin', icon: '⚙', path: '/administration' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredModule, setHoveredModule] = useState(null)

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--vf-bg-primary)' }}>

      {/* Sidebar */}
      <div style={{
        width: 'var(--vf-sidebar-width)',
        backgroundColor: '#080d14',
        borderRight: '1px solid var(--vf-border)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '12px 0',
        gap: '4px', zIndex: 100, position: 'relative'
      }}>

        {/* Logo SVG sidebar */}
        <div
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', marginBottom: '8px' }}
        >
          <svg viewBox="0 0 100 75" width="48" height="48">
            <defs>
              <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0"/>
                <stop offset="100%" stopColor="#94a3b8"/>
              </linearGradient>
              <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="100%" stopColor="#2563eb"/>
              </linearGradient>
            </defs>
            {/* V gauche argenté */}
            <polygon points="2,4 16,4 36,62 22,62" fill="url(#silverGrad)"/>
            {/* V droite bleu */}
            <polygon points="54,4 40,4 36,62 50,62" fill="url(#blueGrad)"/>
            {/* F barre haute */}
            <rect x="58" y="4" width="40" height="11" rx="3" fill="url(#blueGrad)"/>
            {/* F montant vertical */}
            <rect x="58" y="4" width="11" height="52" rx="3" fill="url(#blueGrad)"/>
            {/* F barre milieu */}
            <rect x="58" y="32" width="30" height="10" rx="3" fill="url(#blueGrad)"/>
          </svg>
        </div>

        {/* Navigation */}
        {MODULES.map((mod) => {
          const isActive = location.pathname === mod.path
          return (
            <div
              key={mod.id}
              onClick={() => navigate(mod.path)}
              onMouseEnter={() => setHoveredModule(mod.id)}
              onMouseLeave={() => setHoveredModule(null)}
              style={{
                width: '46px', height: '46px',
                borderRadius: '10px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', gap: '2px', position: 'relative',
                backgroundColor: isActive ? 'rgba(37,99,235,0.15)' :
                                 hoveredModule === mod.id ? 'var(--vf-bg-hover)' : 'transparent',
                transition: 'all 0.2s',
              }}>

              {isActive && (
                <div style={{
                  position: 'absolute', left: '-12px',
                  width: '3px', height: '28px',
                  background: 'linear-gradient(180deg, #2563eb, #60a5fa)',
                  borderRadius: '0 3px 3px 0'
                }} />
              )}

              <span style={{ fontSize: '16px' }}>{mod.icon}</span>
              <span style={{
                fontSize: '7px', fontWeight: '600',
                color: isActive ? '#3b82f6' :
                       hoveredModule === mod.id ? '#93c5fd' : '#6b7280',
                letterSpacing: '0.3px'
              }}>
                {mod.label}
              </span>

              {hoveredModule === mod.id && (
                <div style={{
                  position: 'absolute', left: '56px',
                  backgroundColor: '#1e2a3a',
                  border: '1px solid var(--vf-border)',
                  borderRadius: '6px', padding: '6px 10px',
                  fontSize: '12px', fontWeight: '600',
                  color: 'var(--vf-text-primary)',
                  whiteSpace: 'nowrap', zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  {mod.label}
                </div>
              )}
            </div>
          )
        })}

        <div style={{
          width: '32px', height: '1px',
          backgroundColor: 'var(--vf-border)', margin: '8px 0'
        }} />

        <div style={{ marginTop: 'auto' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '10px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', gap: '2px', color: '#6b7280'
          }}>
            <span style={{ fontSize: '16px' }}>↪</span>
            <span style={{ fontSize: '7px', fontWeight: '600' }}>Sortir</span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{
          height: 'var(--vf-topbar-height)',
          backgroundColor: '#080d14',
          borderBottom: '1px solid var(--vf-border)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0px' }}>
              <span style={{
                fontSize: '18px', fontWeight: '800',
                letterSpacing: '1px', color: '#e2e8f0'
              }}>VERNA</span>
              <span style={{
                fontSize: '18px', fontWeight: '800',
                letterSpacing: '1px', color: '#2563eb'
              }}>FLOW</span>
              <span style={{
                fontSize: '11px', fontWeight: '600',
                letterSpacing: '2px', color: '#60a5fa',
                marginLeft: '6px', opacity: 0.8
              }}>GLASS</span>
            </div>
            <div style={{
              fontSize: '9px', color: 'var(--vf-text-muted)',
              letterSpacing: '2px', textTransform: 'uppercase'
            }}>
              Piloter · Organiser · <span style={{ color: '#2563eb' }}>Optimiser</span>
            </div>
          </div>

          <div style={{
            width: '1px', height: '32px',
            backgroundColor: 'var(--vf-border)', margin: '0 8px'
          }} />

          <span style={{ fontSize: '13px', color: 'var(--vf-text-secondary)' }}>
            Miroiterie
          </span>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: 'rgba(16,185,129,0.1)',
              color: '#10b981', padding: '4px 10px',
              borderRadius: '20px', fontSize: '11px',
              fontWeight: '600', border: '1px solid rgba(16,185,129,0.2)'
            }}>
              ● En ligne
            </div>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '12px',
              fontWeight: '700', cursor: 'pointer'
            }}>
              AV
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}