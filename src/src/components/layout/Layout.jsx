import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞', path: '/' },
  { id: 'commerce', label: 'Commerce', icon: '🛒', path: '/commerce' },
  { id: 'production', label: 'Production', icon: '⚙️', path: '/production' },
  { id: 'stock', label: 'Stock', icon: '📦', path: '/stock' },
  { id: 'logistique', label: 'Logistique', icon: '🚚', path: '/logistique' },
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0',
        gap: '4px',
        zIndex: 100,
        position: 'relative'
      }}>

        {/* Logo */}
        <div style={{
          width: '42px', height: '42px',
          background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '900', fontSize: '15px', color: 'white',
          marginBottom: '16px',
          boxShadow: '0 0 20px rgba(37,99,235,0.4)',
          cursor: 'pointer'
        }} onClick={() => navigate('/')}>
          VF
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
                cursor: 'pointer', gap: '2px',
                position: 'relative',
                backgroundColor: isActive ? 'rgba(37,99,235,0.15)' : 
                                 hoveredModule === mod.id ? 'var(--vf-bg-hover)' : 'transparent',
                transition: 'all 0.2s',
              }}>

              {/* Barre active */}
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

              {/* Tooltip */}
              {hoveredModule === mod.id && (
                <div style={{
                  position: 'absolute', left: '56px',
                  backgroundColor: '#1e2a3a',
                  border: '1px solid var(--vf-border)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '12px', fontWeight: '600',
                  color: 'var(--vf-text-primary)',
                  whiteSpace: 'nowrap',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  {mod.label}
                </div>
              )}
            </div>
          )
        })}

        {/* Séparateur */}
        <div style={{
          width: '32px', height: '1px',
          backgroundColor: 'var(--vf-border)',
          margin: '8px 0'
        }} />

        {/* Déconnexion en bas */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{
            width: '46px', height: '46px',
            borderRadius: '10px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', gap: '2px',
            color: '#6b7280'
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
            <div style={{
              fontSize: '18px', fontWeight: '700',
              letterSpacing: '-0.5px', color: 'var(--vf-text-primary)'
            }}>
              VERNA<span style={{ color: '#3b82f6' }}>FLOW</span>
            </div>
            <div style={{
              fontSize: '9px', color: 'var(--vf-text-muted)',
              letterSpacing: '2px', textTransform: 'uppercase'
            }}>
              Piloter · Organiser · Optimiser
            </div>
          </div>

          <div style={{
            width: '1px', height: '32px',
            backgroundColor: 'var(--vf-border)',
            margin: '0 8px'
          }} />

          <span style={{ fontSize: '13px', color: 'var(--vf-text-secondary)' }}>
            Miroiterie
          </span>

          {/* Droite */}
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
              width: '32px', height: '32px',
              borderRadius: '50%',
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