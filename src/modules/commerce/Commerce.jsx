import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'

// ─── CONSTANTES ───────────────────────────────────────────────────
const EPAISSEURS_SIMPLE = [2, 3, 4, 5, 6, 8, 10, 12, 15, 19]
const EPAISSEURS_STADIP_PROTECT = ['33/2', '44/2', '55/2', '66/2']
const EPAISSEURS_STADIP_SILENCE = ['33/2', '44/2', '55/2', '66/2']
const EPAISSEURS_MIRALITE_CLAIR = [2, 3, 4, 5, 6]
const EPAISSEURS_MIRALITE_CLAIR_SAFE = [4, 5, 6]
const EPAISSEURS_MIRALITE_BRONZE = [4, 5, 6]
const EPAISSEURS_MIRALITE_BRONZE_SAFE = [4, 5, 6]
const EPAISSEURS_MIRALITE_GRIS = [4, 5, 6]
const EPAISSEURS_MIRALITE_GRIS_SAFE = [4, 5, 6]
const EPAISSEURS_MIRALITE_ANTIQUE = [4, 5, 6]
const EPAISSEURS_ESTRIADO = [4, 6]
const EPAISSEURS_KRALIKA = [4, 5, 6]
const EPAISSEURS_DIAMANT = [4, 5, 6, 8, 10, 12, 15, 19]
const EPAISSEURS_TIMELESS = [4, 5, 6, 8, 10, 12, 15, 19]


const FORMES = [
  { id: 0, label: 'Rectangle',    icon: '▭', surcote: 2 },
  { id: 1, label: 'Rond',         icon: '○', surcote: 4 },
  { id: 2, label: 'Ovale',        icon: '⬭', surcote: 4 },
  { id: 3, label: 'Tête Cintrée', icon: '◖', surcote: 4 },
  { id: 4, label: 'Trapèze',      icon: '⬡', surcote: 4 },
  { id: 5, label: 'Triangle',     icon: '△', surcote: 4 },
]

const FACONNAGES_CHANT = [
  { id: 'CB',        label: 'CB',        desc: 'Coupe Brute',        hasAngle: false },
  { id: 'JPP',       label: 'JPP',       desc: 'Joint plat poli',    hasAngle: false },
  { id: 'JPI',       label: 'JPI',       desc: 'Joint plat incliné', hasAngle: false },
  { id: 'AA',        label: 'AA',        desc: 'Arrêt arrondi',      hasAngle: false },
  { id: 'CHANFREIN', label: 'Chanfrein', desc: 'Angle à définir',    hasAngle: true  },
]

const FACONNAGES_SPECIAUX = [
  { id: 'JAP',        label: 'JAP',          desc: 'Joint arrondi poli' },
  { id: 'JAI',        label: 'JAI',          desc: 'Joint arrondi incliné' },
  { id: 'BEC_CORBIN', label: 'Bec de corbin',desc: 'Profil bec de corbin' },
  { id: 'JPP_CNC',    label: 'JPP CNC',      desc: 'Joint plat poli CNC' },
]

const FACON_COLORS = {
  CB: '#6b7280', JPP: '#3b82f6', JPI: '#8b5cf6',
  AA: '#10b981', CHANFREIN: '#f59e0b',
}

// ─── STYLES ──────────────────────────────────────────────────────
const S = {
  input: {
    width: '100%', backgroundColor: '#0d1117',
    border: '1px solid #1e2a3a', borderRadius: '8px',
    padding: '10px 14px', color: '#e6edf3', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  },
  label: {
    fontSize: '11px', fontWeight: '600', color: '#6b7280',
    letterSpacing: '0.8px', textTransform: 'uppercase',
    marginBottom: '6px', display: 'block',
  },
  section: {
    backgroundColor: '#111827', border: '1px solid #1e2a3a',
    borderRadius: '12px', padding: '20px', marginBottom: '16px',
  },
  sTitle: {
    fontSize: '12px', fontWeight: '700', color: '#3b82f6',
    letterSpacing: '1.5px', textTransform: 'uppercase',
    marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
  },
  btn: (active, color) => ({
    padding: '7px 13px', borderRadius: '8px',
    border: active ? `1px solid ${color || '#2563eb'}` : '1px solid #1e2a3a',
    backgroundColor: active ? `${color || '#2563eb'}22` : 'transparent',
    color: active ? (color || '#60a5fa') : '#6b7280',
    cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.15s',
  }),
  btnPrimary: {
    backgroundColor: '#2563eb', color: 'white', border: 'none',
    borderRadius: '10px', padding: '12px 24px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer',
  },
  btnGhost: {
    backgroundColor: 'transparent', color: '#9ca3af',
    border: '1px solid #1e2a3a', borderRadius: '10px',
    padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  tag: (color = '#2563eb') => ({
    backgroundColor: `${color}22`, color,
    border: `1px solid ${color}44`,
    padding: '3px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '600',
  }),
}

// ─── APERÇU SVG ──────────────────────────────────────────────────
function PiecePreview({ forme, longueur, largeur, epaisseur, laquageHex, faconnages }) {
  const W = 300, H = 280, pad = 48
  const l  = parseFloat(longueur) || 400
  const la = parseFloat(largeur)  || 300
  const ratio = Math.min((W - pad * 2) / l, (H - pad * 2) / la)
  const pw = l * ratio, ph = la * ratio
  const x  = (W - pw) / 2, y = (H - ph) / 2
  const fill   = laquageHex ? `${laquageHex}cc` : 'rgba(96,165,250,0.12)'
  const stroke = laquageHex || '#60a5fa'

  // Couleur par côté selon façonnages actifs
  const coteColors = { C1: '#1e3a5f', C2: '#1e3a5f', C3: '#1e3a5f', C4: '#1e3a5f' }
  faconnages?.forEach(f => {
    const col = FACON_COLORS[f.id] || stroke
    f.cotes?.forEach(c => { coteColors[c] = col })
  })

  // Épaisseur de trait : actif = 2.5, inactif = 1
  const sw = (c) => faconnages?.some(f => f.cotes?.includes(c)) ? 2.5 : 1

  // ── Rendu selon forme ──
  const renderShape = () => {
    switch (forme) {
      case 1: { // Rond
        const r = Math.min(pw, ph) / 2
        const cx = W / 2, cy = H / 2
        // Cercle divisé en 4 arcs : C1=haut, C2=droite, C3=bas, C4=gauche
        return (
          <g>
            <circle cx={cx} cy={cy} r={r} fill={fill} stroke="none"/>
            {[
              ['C1', cx, cy-r, cx+r, cy,   `M${cx},${cy-r} A${r},${r} 0 0,1 ${cx+r},${cy}`],
              ['C2', cx+r, cy, cx, cy+r,   `M${cx+r},${cy} A${r},${r} 0 0,1 ${cx},${cy+r}`],
              ['C3', cx, cy+r, cx-r, cy,   `M${cx},${cy+r} A${r},${r} 0 0,1 ${cx-r},${cy}`],
              ['C4', cx-r, cy, cx, cy-r,   `M${cx-r},${cy} A${r},${r} 0 0,1 ${cx},${cy-r}`],
            ].map(([c,,,, d]) => (
              <path key={c} d={d} fill="none" stroke={coteColors[c]} strokeWidth={sw(c)}/>
            ))}
            {/* Labels */}
            <text x={cx}   y={cy-r-6}  textAnchor="middle" fill={coteColors.C1} fontSize="9">C1</text>
            <text x={cx+r+8} y={cy+3}  textAnchor="start"  fill={coteColors.C2} fontSize="9">C2</text>
            <text x={cx}   y={cy+r+14} textAnchor="middle" fill={coteColors.C3} fontSize="9">C3</text>
            <text x={cx-r-8} y={cy+3}  textAnchor="end"    fill={coteColors.C4} fontSize="9">C4</text>
          </g>
        )
      }
      case 2: { // Ovale
        const rx = pw/2, ry = ph/2, cx = W/2, cy = H/2
        return (
          <g>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} stroke="none"/>
            {[
              ['C1', `M${cx-rx},${cy} A${rx},${ry} 0 0,1 ${cx+rx},${cy}`],
              ['C2', `M${cx+rx},${cy} A${rx},${ry} 0 0,1 ${cx-rx},${cy}`],
            ].map(([c, d]) => (
              <path key={c} d={d} fill="none" stroke={coteColors[c]} strokeWidth={sw(c)}/>
            ))}
            <path d={`M${cx-rx},${cy} A${rx},${ry} 0 0,0 ${cx+rx},${cy}`} fill="none" stroke={coteColors.C3} strokeWidth={sw('C3')}/>
            <path d={`M${cx+rx},${cy} A${rx},${ry} 0 0,0 ${cx-rx},${cy}`} fill="none" stroke={coteColors.C4} strokeWidth={sw('C4')}/>
            <text x={cx}    y={cy-ry-6}  textAnchor="middle" fill={coteColors.C1} fontSize="9">C1</text>
            <text x={cx+rx+8} y={cy+3}   textAnchor="start"  fill={coteColors.C2} fontSize="9">C2</text>
            <text x={cx}    y={cy+ry+14} textAnchor="middle" fill={coteColors.C3} fontSize="9">C3</text>
            <text x={cx-rx-8} y={cy+3}   textAnchor="end"    fill={coteColors.C4} fontSize="9">C4</text>
          </g>
        )
      }
      case 3: { // Tête cintrée : bas=C3, gauche=C4, droite=C2, arc haut=C1
        const arcR = pw / 2
        return (
          <g>
            <path d={`M${x},${y+ph} L${x},${y+ph/2} A${arcR},${ph/2} 0 0,1 ${x+pw},${y+ph/2} L${x+pw},${y+ph} Z`}
              fill={fill} stroke="none"/>
            <path d={`M${x},${y+ph/2} A${arcR},${ph/2} 0 0,1 ${x+pw},${y+ph/2}`}
              fill="none" stroke={coteColors.C1} strokeWidth={sw('C1')}/>
            <line x1={x+pw} y1={y+ph/2} x2={x+pw} y2={y+ph} stroke={coteColors.C2} strokeWidth={sw('C2')}/>
            <line x1={x+pw} y1={y+ph}   x2={x}    y2={y+ph} stroke={coteColors.C3} strokeWidth={sw('C3')}/>
            <line x1={x}    y1={y+ph}   x2={x}    y2={y+ph/2} stroke={coteColors.C4} strokeWidth={sw('C4')}/>
            <text x={W/2}   y={y-6}     textAnchor="middle" fill={coteColors.C1} fontSize="9">C1</text>
            <text x={x+pw+8} y={y+ph*0.75} textAnchor="start" fill={coteColors.C2} fontSize="9">C2</text>
            <text x={W/2}   y={y+ph+14} textAnchor="middle" fill={coteColors.C3} fontSize="9">C3</text>
            <text x={x-8}   y={y+ph*0.75} textAnchor="end"  fill={coteColors.C4} fontSize="9">C4</text>
          </g>
        )
      }
      case 4: { // Trapèze
        const pts = `${x+pw*0.15},${y} ${x+pw*0.85},${y} ${x+pw},${y+ph} ${x},${y+ph}`
        return (
          <g>
            <polygon points={pts} fill={fill} stroke="none"/>
            <line x1={x+pw*0.15} y1={y}    x2={x+pw*0.85} y2={y}    stroke={coteColors.C1} strokeWidth={sw('C1')}/>
            <line x1={x+pw*0.85} y1={y}    x2={x+pw}      y2={y+ph} stroke={coteColors.C2} strokeWidth={sw('C2')}/>
            <line x1={x+pw}      y1={y+ph} x2={x}          y2={y+ph} stroke={coteColors.C3} strokeWidth={sw('C3')}/>
            <line x1={x}         y1={y+ph} x2={x+pw*0.15}  y2={y}    stroke={coteColors.C4} strokeWidth={sw('C4')}/>
            <text x={W/2}        y={y-6}   textAnchor="middle" fill={coteColors.C1} fontSize="9">C1</text>
            <text x={x+pw+6}     y={y+ph/2} textAnchor="start" fill={coteColors.C2} fontSize="9">C2</text>
            <text x={W/2}        y={y+ph+14} textAnchor="middle" fill={coteColors.C3} fontSize="9">C3</text>
            <text x={x-6}        y={y+ph/2} textAnchor="end"   fill={coteColors.C4} fontSize="9">C4</text>
          </g>
        )
      }
      case 5: { // Triangle
        return (
          <g>
            <polygon points={`${x+pw/2},${y} ${x+pw},${y+ph} ${x},${y+ph}`} fill={fill} stroke="none"/>
            <line x1={x+pw/2} y1={y}    x2={x+pw}   y2={y+ph} stroke={coteColors.C2} strokeWidth={sw('C2')}/>
            <line x1={x+pw}   y1={y+ph} x2={x}       y2={y+ph} stroke={coteColors.C3} strokeWidth={sw('C3')}/>
            <line x1={x}      y1={y+ph} x2={x+pw/2}  y2={y}    stroke={coteColors.C4} strokeWidth={sw('C4')}/>
            <text x={x+pw*0.82} y={y+ph/2} textAnchor="start" fill={coteColors.C2} fontSize="9">C2</text>
            <text x={W/2}       y={y+ph+14} textAnchor="middle" fill={coteColors.C3} fontSize="9">C3</text>
            <text x={x+pw*0.1}  y={y+ph/2} textAnchor="end"   fill={coteColors.C4} fontSize="9">C4</text>
          </g>
        )
      }
      default: { // Rectangle
        return (
          <g>
            <rect x={x} y={y} width={pw} height={ph} rx="2" fill={fill} stroke="none"/>
            <line x1={x}    y1={y}    x2={x+pw} y2={y}    stroke={coteColors.C1} strokeWidth={sw('C1')}/>
            <line x1={x+pw} y1={y}    x2={x+pw} y2={y+ph} stroke={coteColors.C2} strokeWidth={sw('C2')}/>
            <line x1={x+pw} y1={y+ph} x2={x}    y2={y+ph} stroke={coteColors.C3} strokeWidth={sw('C3')}/>
            <line x1={x}    y1={y+ph} x2={x}    y2={y}    stroke={coteColors.C4} strokeWidth={sw('C4')}/>
            <text x={W/2}    y={y-6}     textAnchor="middle" fill={coteColors.C1} fontSize="9">C1</text>
            <text x={x+pw+8} y={y+ph/2}  textAnchor="start"  fill={coteColors.C2} fontSize="9">C2</text>
            <text x={W/2}    y={y+ph+14} textAnchor="middle" fill={coteColors.C3} fontSize="9">C3</text>
            <text x={x-8}    y={y+ph/2}  textAnchor="end"    fill={coteColors.C4} fontSize="9">C4</text>
          </g>
        )
      }
    }
  }

  return (
    <svg width={W} height={H}>
      <defs>
        <pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0L0 0 0 20" fill="none" stroke="#1e2a3a" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#g)" rx="8"/>
      {renderShape()}
      {/* Cotes dimensions */}
      {longueur && forme !== 1 && (
        <>
          <line x1={x} y1={y+ph+20} x2={x+pw} y2={y+ph+20} stroke="#1e2a3a" strokeWidth="1"/>
          <text x={x+pw/2} y={y+ph+30} textAnchor="middle" fill="#4b5563" fontSize="10">{longueur} mm</text>
        </>
      )}
      {longueur && forme === 1 && (
        <text x={W/2} y={y+ph/2+4} textAnchor="middle" fill="#4b5563" fontSize="10">Ø {longueur} mm</text>
      )}
      {largeur && forme !== 1 && forme !== 2 && (
        <>
          <line x1={x-20} y1={y} x2={x-20} y2={y+ph} stroke="#1e2a3a" strokeWidth="1"/>
          <text x={x-30} y={y+ph/2} textAnchor="middle" fill="#4b5563" fontSize="10"
            transform={`rotate(-90,${x-30},${y+ph/2})`}>{largeur} mm</text>
        </>
      )}
      {epaisseur && (
        <g>
          <rect x={W/2-24} y={5} width="48" height="18" rx="9"
            fill="rgba(37,99,235,0.25)" stroke="#2563eb44" strokeWidth="1"/>
          <text x={W/2} y={18} textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="700">
            {epaisseur} mm
          </text>
        </g>
      )}
    </svg>
  )
}

// ─── MODALE GÉNÉRIQUE ────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.75)',
      zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ backgroundColor:'#111827', border:'1px solid #1e2a3a',
        borderRadius:'16px', padding:'28px', width:'560px', maxHeight:'80vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <div style={{ fontSize:'16px', fontWeight:'700', color:'#e6edf3' }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#6b7280', fontSize:'22px', cursor:'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalSablage({ value, onChange, onClose }) {
  const [type, setType]     = useState(value?.type || '')
  const [fichier, setFichier] = useState(null)
  return (
    <Modal title="🔲 Sablage" onClose={onClose}>
      <label style={S.label}>Type</label>
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' }}>
        {['Uni','Partiel','Dégradé','Motif (PDF/DXF)'].map(t => (
          <button key={t} style={S.btn(type===t)} onClick={() => setType(t)}>{t}</button>
        ))}
      </div>
      {type === 'Motif (PDF/DXF)' && (
        <div style={{ marginBottom:'16px' }}>
          <label style={S.label}>Fichier (PDF ou DXF)</label>
          <input type="file" accept=".pdf,.dxf" style={{ ...S.input, padding:'8px' }}
            onChange={e => setFichier(e.target.files[0])}/>
          {fichier && <div style={{ fontSize:'12px', color:'#10b981', marginTop:'6px' }}>✓ {fichier.name}</div>}
        </div>
      )}
      <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
        <button style={S.btnGhost} onClick={onClose}>Annuler</button>
        <button style={S.btnPrimary} onClick={() => { onChange({ type, fichier }); onClose() }}>Valider</button>
      </div>
    </Modal>
  )
}

function ModalGravure({ value, onChange, onClose }) {
  const [fichier, setFichier] = useState(null)
  const [note, setNote]       = useState(value?.note || '')
  return (
    <Modal title="✏️ Gravure" onClose={onClose}>
      <div style={{ marginBottom:'16px' }}>
        <label style={S.label}>Fichier (PDF ou DXF)</label>
        <input type="file" accept=".pdf,.dxf" style={{ ...S.input, padding:'8px' }}
          onChange={e => setFichier(e.target.files[0])}/>
        {fichier && <div style={{ fontSize:'12px', color:'#10b981', marginTop:'6px' }}>✓ {fichier.name}</div>}
      </div>
      <div style={{ marginBottom:'20px' }}>
        <label style={S.label}>Note</label>
        <input style={S.input} placeholder="Instructions..." value={note} onChange={e => setNote(e.target.value)}/>
      </div>
      <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
        <button style={S.btnGhost} onClick={onClose}>Annuler</button>
        <button style={S.btnPrimary} onClick={() => { onChange({ fichier, note }); onClose() }}>Valider</button>
      </div>
    </Modal>
  )
}

function ModalLaquage({ value, onChange, onClose }) {
  const [couleurs, setCouleurs] = useState([])
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(value || null)
  const [face, setFace]         = useState(value?.face || 2)

  useEffect(() => {
    supabase.from('laquage').select('*').eq('actif', true)
      .then(({ data }) => { if (data) setCouleurs(data) })
  }, [])

  const filtered = couleurs.filter(c =>
    c.code_ral?.toLowerCase().includes(search.toLowerCase()) ||
    c.nom_couleur?.toLowerCase().includes(search.toLowerCase()) ||
    c.famille?.toLowerCase().includes(search.toLowerCase())
  )
  const familles = [...new Set(couleurs.map(c => c.famille))]

  return (
    <Modal title="🎨 Laquage" onClose={onClose}>
      <input style={{ ...S.input, marginBottom:'12px' }}
        placeholder="Rechercher RAL, nom ou famille..."
        value={search} onChange={e => setSearch(e.target.value)}/>
      {!search && (
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'12px' }}>
          {familles.map(f => (
            <button key={f} style={{ ...S.btn(false), fontSize:'11px' }} onClick={() => setSearch(f)}>{f}</button>
          ))}
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px',
        marginBottom:'16px', maxHeight:'240px', overflowY:'auto' }}>
        {filtered.map(c => (
          <div key={c.id} onClick={() => setSelected(c)} style={{
            borderRadius:'8px', overflow:'hidden', cursor:'pointer',
            border: selected?.id===c.id ? '2px solid #2563eb' : '1px solid #1e2a3a',
          }}>
            <div style={{ height:'36px', backgroundColor: c.hex_couleur || '#333' }}/>
            <div style={{ padding:'6px', backgroundColor:'#0d1117' }}>
              <div style={{ fontSize:'10px', fontWeight:'700', color:'#e6edf3' }}>{c.code_ral}</div>
              <div style={{ fontSize:'9px', color:'#6b7280' }}>{c.nom_couleur}</div>
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px',
          backgroundColor:'#0d1117', borderRadius:'8px', padding:'12px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'6px', backgroundColor: selected.hex_couleur }}/>
          <div>
            <div style={{ color:'#e6edf3', fontWeight:'700' }}>{selected.code_ral} — {selected.nom_couleur}</div>
            <div style={{ color:'#6b7280', fontSize:'11px' }}>{selected.famille}</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:'6px' }}>
            {[1,2].map(f => <button key={f} style={S.btn(face===f)} onClick={() => setFace(f)}>Face {f}</button>)}
          </div>
        </div>
      )}
      <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
        <button style={S.btnGhost} onClick={onClose}>Annuler</button>
        <button style={S.btnPrimary}
          onClick={() => { if (selected) { onChange({ ...selected, face }); onClose() } }}>Valider</button>
      </div>
    </Modal>
  )
}

function ModalFaconnageSpecial({ selected, onChange, onClose }) {
  const [sel, setSel] = useState(selected || [])
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id])
  return (
    <Modal title="⚙️ Façonnage spécial" onClose={onClose}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
        {FACONNAGES_SPECIAUX.map(f => (
          <div key={f.id} onClick={() => toggle(f.id)} style={{
            padding:'14px', borderRadius:'10px', cursor:'pointer',
            border: sel.includes(f.id) ? '1px solid #2563eb' : '1px solid #1e2a3a',
            backgroundColor: sel.includes(f.id) ? 'rgba(37,99,235,0.1)' : '#0d1117',
          }}>
            <div style={{ color:'#e6edf3', fontWeight:'700', fontSize:'13px' }}>{f.label}</div>
            <div style={{ color:'#6b7280', fontSize:'11px', marginTop:'2px' }}>{f.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
        <button style={S.btnGhost} onClick={onClose}>Annuler</button>
        <button style={S.btnPrimary} onClick={() => { onChange(sel); onClose() }}>Valider</button>
      </div>
    </Modal>
  )
}
function ModalContact({ contacts, onClose }) {
  return (
    <Modal title="👥 Contacts" onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {contacts.map(c => (
          <div key={c.id} style={{ backgroundColor:'#0d1117', borderRadius:'10px',
            padding:'14px', border:`1px solid ${c.principal ? '#2563eb44' : '#1e2a3a'}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ color:'#e6edf3', fontWeight:'700', fontSize:'14px' }}>
                  {c.prenom} {c.nom}
                </span>
                {c.principal && <span style={S.tag('#10b981')}>Principal</span>}
              </div>
              {c.poste && <span style={{ color:'#6b7280', fontSize:'11px' }}>{c.poste}</span>}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
              {[
                ['Téléphone', c.telephone],
                ['Email',     c.email],
                ['Adresse',   c.adresse],
              ].filter(([,v]) => v).map(([lbl, val]) => (
                <div key={lbl} style={{ backgroundColor:'#080d14', borderRadius:'6px', padding:'6px 10px' }}>
                  <div style={{ fontSize:'10px', color:'#4b5563', marginBottom:'2px',
                    textTransform:'uppercase', letterSpacing:'0.6px' }}>{lbl}</div>
                  <div style={{ fontSize:'12px', color:'#e6edf3', fontWeight:'600' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────
export default function Commerce() {
  const [searchClient, setSearchClient]           = useState('')
  const [clientSuggestions, setClientSuggestions] = useState([])
  const [clientSelectionne, setClientSelectionne] = useState(null)

const [modalContact, setModalContact] = useState(false)
const [contacts, setContacts]         = useState([])
 
  const [typeDoc, setTypeDoc]                     = useState('devis')
  const [numeroCommande, setNumeroCommande]       = useState('')
  const [positions, setPositions]                 = useState([])

  const [modalSablage, setModalSablage]           = useState(false)
  const [modalGravure, setModalGravure]           = useState(false)
  const [modalLaquage, setModalLaquage]           = useState(false)
  const [modalFaconSpecial, setModalFaconSpecial] = useState(false)
 

  const [form, setForm] = useState({
    epaisseur_type: 'simple', epaisseur: '', matiere: '',
    forme: 0, longueur: '', largeur: '', quantite: 1, face: 1,
    faconnages: [],
    faconnages_speciaux: [],
    securit: null,
    sablage: null, gravure: null, laquage: null,
    emballage: false, expedition: false,
    trous: [], encoches: [],
    _matiereSearch: '',
    reference_client: '', remarque: '',
  })
  const [matieres, setMatieres] = useState([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved]     = useState(false)

  // ── Calculs ──
  const surcote  = FORMES.find(f => f.id === form.forme)?.surcote || 2
  const longP    = form.longueur ? +form.longueur + surcote : ''
  const largP    = form.largeur  ? +form.largeur  + surcote : ''
  const surface  = form.longueur && form.largeur ? ((+form.longueur * +form.largeur) / 1e6).toFixed(4) : 0
  const surfaceP = longP && largP ? ((longP * largP) / 1e6).toFixed(4) : 0
  const poids    = form.longueur && form.largeur && form.epaisseur
    ? ((+form.longueur/1000) * (+form.largeur/1000) * parseFloat(form.epaisseur) * 2.5).toFixed(2) : 0
  const ml       = form.longueur && form.largeur ? (((+form.longueur + +form.largeur)*2)/1000).toFixed(2) : 0

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── Façonnage ──
  const toggleFaconnage = (id) => {
    setForm(f => {
      const exists = f.faconnages.find(x => x.id === id)
      if (exists) return { ...f, faconnages: f.faconnages.filter(x => x.id !== id) }
      return { ...f, faconnages: [...f.faconnages, { id, cotes: ['C1','C2','C3','C4'], angle: '' }] }
    })
  }
  const toggleCote = (facId, cote) => setForm(f => ({
    ...f, faconnages: f.faconnages.map(x =>
      x.id !== facId ? x : {
        ...x,
        cotes: x.cotes.includes(cote) ? x.cotes.filter(c => c !== cote) : [...x.cotes, cote],
      }
    ),
  }))
  const setFaconAngle = (id, val) => setForm(f => ({
    ...f, faconnages: f.faconnages.map(x => x.id === id ? { ...x, angle: val } : x),
  }))

  // ── Trous ──
  const addTrou    = () => setField('trous', [...form.trous,
    { id: Date.now(), diametre:'', pos_x:'', pos_y:'', fraisage:false, diam_fraisage:'' }])
  const updateTrou = (id, k, v) => setField('trous', form.trous.map(t => t.id===id ? {...t,[k]:v} : t))
  const removeTrou = (id) => setField('trous', form.trous.filter(t => t.id !== id))

  // ── Encoches ──
  const addEncoche    = () => setField('encoches', [...form.encoches,
    { id: Date.now(), longueur:'', largeur:'', rayon:'', position:'' }])
  const updateEncoche = (id, k, v) => setField('encoches', form.encoches.map(e => e.id===id ? {...e,[k]:v} : e))
  const removeEncoche = (id) => setField('encoches', form.encoches.filter(e => e.id !== id))

  useEffect(() => { genererNumero() }, [])
  
useEffect(() => {
  supabase.from('stock_verre')
    .select('matiere, epaisseur, famille')
    .eq('actif', true)
    .order('famille').order('matiere').order('epaisseur')
    .then(({ data }) => { if (data) setMatieres(data) })
}, [])

  useEffect(() => {
    if (searchClient.length < 2) { setClientSuggestions([]); return }
    supabase.from('clients')
      // useEffect searchClient
.select('id, entreprise_nom, numero_compte, ville, adresse, code_postal, pays, telephone, fax, email, remise_client, condition_paiement')
      .ilike('entreprise_nom', `%${searchClient}%`)
      .limit(8)
      .then(({ data }) => setClientSuggestions(data || []))
  }, [searchClient])

  const genererNumero = async () => {
    const annee = new Date().getFullYear()
    const { count } = await supabase.from('commandes').select('*', { count:'exact', head:true })
    setNumeroCommande(`CMD-${annee}-${String((count||0)+1).padStart(4,'0')}`)
  }

  const ajouterPosition = () => {
    setPositions(p => [...p, { numero: p.length+1, ...form, surface, surfaceP, poids, ml, longP, largP }])
    setForm(f => ({ ...f, longueur:'', largeur:'', quantite:1, remarque:'', reference_client:'', trous:[], encoches:[] }))
    setSaved(false)
  }

  const sauvegarder = async () => {
    if (!clientSelectionne || positions.length === 0) return
    setLoading(true)
    try {
      const { data: cmd, error } = await supabase.from('commandes').insert({
        numero_commande: numeroCommande,
        client_nom: clientSelectionne.entreprise_nom,
        statut: typeDoc, statut_global: 'en_cours',
        date_creation: new Date().toISOString(),
      }).select().single()
      if (error) throw error
      for (const pos of positions) {
        await supabase.from('positions').insert({
          commande_id: cmd.id, numero_position: pos.numero,
          matiere: pos.matiere, epaisseur: pos.epaisseur,
          longueur: pos.longueur, quantite: pos.quantite,
          surface: pos.surface, metre_lineaire: pos.ml,
          poids: pos.poids, statut_production: 'en_attente',
        })
      }
      setSaved(true)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const libelleMatiere = form.epaisseur
    ? `${form.epaisseur_type==='stadip' ? 'Stadip' : 'Planiclear'} ${form.epaisseur}${form.epaisseur_type==='simple' ? ' mm' : ''}`
    : '—'

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', height:'100%', backgroundColor:'#0d1117', overflow:'hidden' }}>

      {/* Modales */}
      {modalContact      && <ModalContact contacts={contacts} onClose={() => setModalContact(false)}/>}
      {modalSablage      && <ModalSablage value={form.sablage} onChange={v=>setField('sablage',v)} onClose={()=>setModalSablage(false)}/>}
      {modalGravure      && <ModalGravure value={form.gravure} onChange={v=>setField('gravure',v)} onClose={()=>setModalGravure(false)}/>}
      {modalLaquage      && <ModalLaquage value={form.laquage} onChange={v=>setField('laquage',v)} onClose={()=>setModalLaquage(false)}/>}
      {modalFaconSpecial && <ModalFaconnageSpecial selected={form.faconnages_speciaux} onChange={v=>setField('faconnages_speciaux',v)} onClose={()=>setModalFaconSpecial(false)}/>}

      {/* ══ COLONNE GAUCHE ══ */}
      <div style={{ width:'55%', overflowY:'auto', padding:'24px', borderRight:'1px solid #1e2a3a' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontSize:'22px', fontWeight:'700', color:'#e6edf3', margin:0 }}>Nouveau document</h1>
            <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'4px' }}>{numeroCommande}</div>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button style={S.btn(typeDoc==='devis')}    onClick={()=>setTypeDoc('devis')}>Devis</button>
            <button style={S.btn(typeDoc==='commande')} onClick={()=>setTypeDoc('commande')}>Commande</button>
            <button style={S.btn(typeDoc==='relance')} onClick={()=>setTypeDoc('relance')}>Relance</button>
          </div>
        </div>

        {/* ─── CLIENT ─── */}
        <div style={S.section}>
          <div style={S.sTitle}>👤 Client</div>
          {!clientSelectionne ? (
            <div style={{ position:'relative' }}>
              <input style={S.input} placeholder="Rechercher un client..."
                value={searchClient} onChange={e=>setSearchClient(e.target.value)}/>
              {clientSuggestions.length > 0 && (
                <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:50,
                  backgroundColor:'#111827', border:'1px solid #1e2a3a', borderRadius:'8px', marginTop:'4px' }}>
                  {clientSuggestions.map(c => (
                    <div key={c.id}
                      onClick={() => { setClientSelectionne(c); setSearchClient('') }}
                      // onClick suggestion client
onClick={() => {
  setClientSelectionne(c)
  setSearchClient('')
  supabase.from('contact_client')
    .select('*')
    .eq('client_id', c.id)
    .order('principal', { ascending: false })
    .then(({ data }) => setContacts(data || []))
}}
                      style={{ padding:'10px 16px', cursor:'pointer', borderBottom:'1px solid #1e2a3a',
                        display:'flex', justifyContent:'space-between' }}
                      onMouseEnter={e=>e.currentTarget.style.backgroundColor='#1e2a3a'}
                      onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
                      <div>
                        <div style={{ color:'#e6edf3', fontWeight:'600', fontSize:'13px' }}>{c.entreprise_nom}</div>
                        <div style={{ color:'#6b7280', fontSize:'11px' }}>{c.numero_compte} · {c.ville}</div>
                      </div>
                      {c.remise_client > 0 && <span style={S.tag('#10b981')}>-{c.remise_client}%</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              
              
<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
    <div style={{ color:'#e6edf3', fontWeight:'700', fontSize:'16px' }}>{clientSelectionne.entreprise_nom}</div>
    {clientSelectionne.remise_client > 0 && (
      <span style={{ ...S.tag('#10b981'), fontSize:'10px', padding:'2px 7px' }}>
        -{clientSelectionne.remise_client}%
      </span>
    )}
  </div>
  <div style={{ display:'flex', gap:'8px' }}>
    {/* Contacts */}
    {contacts.length > 0 && (
      <button style={{ ...S.btn(false,'#60a5fa'), padding:'5px 12px', fontSize:'11px', display:'flex', alignItems:'center', gap:'6px' }}
        onClick={()=>setModalContact(true)}>
        👥 Contacts <span style={S.tag('#60a5fa')}>{contacts.length}</span>
      </button>
    )}
  
  
    <button style={{ ...S.btnGhost, padding:'5px 12px', fontSize:'11px' }}
      onClick={()=>setClientSelectionne(null)}>Changer</button>
  </div>
</div>
              {clientSelectionne.numero_compte && (
                <div style={{ color:'#6b7280', fontSize:'11px', marginBottom:'12px' }}>N° {clientSelectionne.numero_compte}</div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'8px' }}>
                {[
                  ['Adresse',   clientSelectionne.adresse],
                  ['CP / Ville', clientSelectionne.code_postal && clientSelectionne.ville
                      ? `${clientSelectionne.code_postal} ${clientSelectionne.ville}` : clientSelectionne.ville],
                ].filter(([,v]) => v).map(([lbl, val]) => (
                  <div key={lbl} style={{ backgroundColor:'#0d1117', borderRadius:'8px',
                    padding:'8px 12px', border:'1px solid #1e2a3a' }}>
                    <div style={{ fontSize:'10px', color:'#4b5563', marginBottom:'3px',
                      textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:'600' }}>{lbl}</div>
                    <div style={{ fontSize:'12px', color:'#e6edf3', fontWeight:'600' }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'14px' }}>
                
{[
  
  ['Pays',       clientSelectionne.pays],
  ['Téléphone',  clientSelectionne.telephone],
  ['Fax',  clientSelectionne.fax],
  ['Email',      clientSelectionne.email],
  ['Règlement',  clientSelectionne['condition_paiement']],
 
].filter(([,v]) => v).map(([lbl, val]) => (
                  <div key={lbl} style={{ backgroundColor:'#0d1117', borderRadius:'8px',
                    padding:'8px 12px', border:'1px solid #1e2a3a' }}>
                    <div style={{ fontSize:'10px', color:'#4b5563', marginBottom:'3px',
                      textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:'600' }}>{lbl}</div>
                    <div style={{ fontSize:'12px', color:'#e6edf3', fontWeight:'600' }}>{val}</div>
                  </div>
                ))}
              </div>
              <div>
                

                <label style={S.label}>Réf. client</label>
                <input style={S.input} placeholder="Référence client..."
                  value={form.reference_client} onChange={e=>setField('reference_client',e.target.value)}/>
              </div>
            </div>
          )}
        </div>
        
  

        {/* ─── MATIÈRE & DIMENSIONS ─── */}
        <div style={S.section}>
          <div style={S.sTitle}>🔲 Matière & Dimensions</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
            <div>
              <label style={S.label}>Matière & Épaisseur</label>
             
                <div style={{ position:'relative' }}>
  <input style={S.input}
    placeholder="Rechercher matière... (ex: Miralite, Timeless)"
    value={form.matiere && form.epaisseur
      ? `${form.matiere} ${form.epaisseur} mm`
      : form._matiereSearch || ''}
    onChange={e => {
      setForm(f => ({ ...f, _matiereSearch: e.target.value, matiere:'', epaisseur:'' }))
    }}
    onFocus={e => {
      if (form.matiere) setForm(f => ({ ...f, _matiereSearch: '' }))
    }}
  />
  {/* Dropdown filtré */}
  {form._matiereSearch && !form.matiere && (() => {
    const search = form._matiereSearch.toLowerCase()
    const filtered = matieres.filter(m =>
      m.matiere.toLowerCase().includes(search) ||
      m.famille.toLowerCase().includes(search) ||
      String(m.epaisseur).includes(search)
    )
    const familles = [...new Set(filtered.map(m => m.famille))]
    if (filtered.length === 0) return null
    return (
      <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:100,
        backgroundColor:'#111827', border:'1px solid #1e2a3a',
        borderRadius:'8px', marginTop:'4px', maxHeight:'260px', overflowY:'auto' }}>
        {familles.map(famille => (
          <div key={famille}>
            <div style={{ padding:'6px 14px', fontSize:'10px', color:'#4b5563',
              textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:'700',
              borderBottom:'1px solid #1e2a3a', backgroundColor:'#0d1117' }}>
              {famille}
            </div>
            {filtered.filter(m => m.famille===famille).map(m => (
              <div key={`${m.matiere}|${m.epaisseur}`}
                onClick={() => {
                  setForm(f => ({ ...f, matiere:m.matiere, epaisseur:String(m.epaisseur),
                    epaisseur_type: m.famille==='Feuilleté' ? 'stadip' : 'simple',
                    _matiereSearch: '' }))
                }}
                style={{ padding:'8px 14px', cursor:'pointer', fontSize:'13px',
                  color:'#e6edf3', borderBottom:'1px solid #0d1117',
                  display:'flex', justifyContent:'space-between', alignItems:'center' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor='#1e2a3a'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                <span>{m.matiere}</span>
                <span style={S.tag()}>{m.epaisseur} mm</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  })()}
  {/* Bouton reset */}
  {form.matiere && (
    <button
      style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)',
        background:'none', border:'none', color:'#6b7280', cursor:'pointer', fontSize:'16px' }}
      onClick={() => setForm(f => ({ ...f, matiere:'', epaisseur:'', _matiereSearch:'' }))}>
      ×
    </button>
  )}
</div>
            </div>
            <div>
              // Bouton Face Verre
              <label style={S.label}>Face</label>
              <div style={{ display:'flex', gap:'8px', marginTop:'2px' }}>
                <button style={S.btn(form.face===1)} onClick={()=>setField('face',1)}>☀️ Face 1</button>
                <button style={S.btn(form.face===2)} onClick={()=>setField('face',2)}>🌑 Face 2</button>
              </div>
            </div>
          </div>

          {/* Forme */}
          <div style={{ marginBottom:'16px' }}>
            <label style={S.label}>Forme</label>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {FORMES.map(f => (
                <button key={f.id} style={S.btn(form.forme===f.id)} onClick={()=>setField('forme',f.id)}>
                  {f.icon} {f.label}
                </button>
              ))}
              <button style={{ ...S.btn(false), borderStyle:'dashed' }}
                onClick={()=>alert('Catalogue DXF — à venir')}>📂 Catalogue</button>
            </div>
          </div>

          {/* Dimensions */}
<div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
  {form.forme === 1 ? (
    /* Rond — diamètre seul */
    <div>
      <label style={S.label}>Diamètre (mm)</label>
      <input style={S.input} type="number" placeholder="ex: 500"
        value={form.longueur} onChange={e => { setField('longueur', e.target.value); setField('largeur', e.target.value) }}/>
      {form.longueur && <div style={{ fontSize:'10px', color:'#f59e0b', marginTop:'4px' }}>
        Primitif : {longP} mm
      </div>}
    </div>
  ) : form.forme === 2 ? (
    /* Ovale — grand axe / petit axe */
    <>
      <div>
        <label style={S.label}>Grand axe (mm)</label>
        <input style={S.input} type="number" placeholder="ex: 600"
          value={form.longueur} onChange={e => setField('longueur', e.target.value)}/>
        {form.longueur && <div style={{ fontSize:'10px', color:'#f59e0b', marginTop:'4px' }}>
          Primitif : {longP} mm
          <div style={{ color:'#6b7280', marginTop:'1px' }}>Côtés : 1 & 3</div>
        </div>}
      </div>
      <div>
        <label style={S.label}>Petit axe (mm)</label>
        <input style={S.input} type="number" placeholder="ex: 400"
          value={form.largeur} onChange={e => setField('largeur', e.target.value)}/>
        {form.largeur && <div style={{ fontSize:'10px', color:'#f59e0b', marginTop:'4px' }}>
          Primitif : {largP} mm
          <div style={{ color:'#6b7280', marginTop:'1px' }}>Côtés : 2 & 4</div>
        </div>}
      </div>
    </>
  ) : form.forme === 3 ? (
    /* Tête cintrée — largeur + hauteur */
    <>
      <div>
        <label style={S.label}>Largeur (mm)</label>
        <input style={S.input} type="number" placeholder="ex: 600"
          value={form.longueur} onChange={e => setField('longueur', e.target.value)}/>
        {form.longueur && <div style={{ fontSize:'10px', color:'#f59e0b', marginTop:'4px' }}>
          Primitif : {longP} mm
          <div style={{ color:'#6b7280', marginTop:'1px' }}>Côtés : 1 & 3</div>
        </div>}
      </div>
      <div>
        <label style={S.label}>Hauteur (mm)</label>
        <input style={S.input} type="number" placeholder="ex: 400"
          value={form.largeur} onChange={e => setField('largeur', e.target.value)}/>
        {form.largeur && <div style={{ fontSize:'10px', color:'#f59e0b', marginTop:'4px' }}>
          Primitif : {largP} mm
          <div style={{ color:'#6b7280', marginTop:'1px' }}>Côtés : 2 & 4</div>
        </div>}
      </div>
    </>
  ) : form.forme === 4 ? (
    /* Trapèze — base + hauteur */
    <>
      <div>
        <label style={S.label}>Base (mm)</label>
        <input style={S.input} type="number" placeholder="ex: 600"
          value={form.longueur} onChange={e => setField('longueur', e.target.value)}/>
        {form.longueur && <div style={{ fontSize:'10px', color:'#f59e0b', marginTop:'4px' }}>
          Primitif : {longP} mm
          <div style={{ color:'#6b7280', marginTop:'1px' }}>Côtés : 1 & 3</div>
        </div>}
      </div>
      <div>
        <label style={S.label}>Hauteur (mm)</label>
        <input style={S.input} type="number" placeholder="ex: 400"
          value={form.largeur} onChange={e => setField('largeur', e.target.value)}/>
        {form.largeur && <div style={{ fontSize:'10px', color:'#f59e0b', marginTop:'4px' }}>
          Primitif : {largP} mm
          <div style={{ color:'#6b7280', marginTop:'1px' }}>Côtés : 2 & 4</div>
        </div>}
      </div>
    </>
  ) : form.forme === 5 ? (
    /* Triangle — base + hauteur */
    <>
      <div>
        <label style={S.label}>Base (mm)</label>
        <input style={S.input} type="number" placeholder="ex: 600"
          value={form.longueur} onChange={e => setField('longueur', e.target.value)}/>
        {form.longueur && <div style={{ fontSize:'10px', color:'#f59e0b', marginTop:'4px' }}>
          Primitif : {longP} mm
          <div style={{ color:'#6b7280', marginTop:'1px' }}>Côtés : 1 & 3</div>
        </div>}
      </div>
      <div>
        <label style={S.label}>Hauteur (mm)</label>
        <input style={S.input} type="number" placeholder="ex: 400"
          value={form.largeur} onChange={e => setField('largeur', e.target.value)}/>
        {form.largeur && <div style={{ fontSize:'10px', color:'#f59e0b', marginTop:'4px' }}>
          Primitif : {largP} mm
          <div style={{ color:'#6b7280', marginTop:'1px' }}>Côtés : 2 & 4</div>
        </div>}
      </div>
    </>
  ) : (
    /* Rectangle (défaut) — longueur + largeur */
    <>
      <div>
        <label style={S.label}>Longueur (mm)</label>
        <input style={S.input} type="number" placeholder="ex: 600"
          value={form.longueur} onChange={e => setField('longueur', e.target.value)}/>
        {form.longueur && <div style={{ fontSize:'10px', color:'#f59e0b', marginTop:'4px' }}>
          Primitif : {longP} mm
          <div style={{ color:'#6b7280', marginTop:'1px' }}>Côtés : 1 & 3</div>
        </div>}
      </div>
      <div>
        <label style={S.label}>Largeur (mm)</label>
        <input style={S.input} type="number" placeholder="ex: 400"
          value={form.largeur} onChange={e => setField('largeur', e.target.value)}/>
        {form.largeur && <div style={{ fontSize:'10px', color:'#f59e0b', marginTop:'4px' }}>
          Primitif : {largP} mm
          <div style={{ color:'#6b7280', marginTop:'1px' }}>Côtés : 2 & 4</div>
        </div>}
      </div>
    </>
  )}
  <div>
    <label style={S.label}>Quantité</label>
    <input style={S.input} type="number" min="1"
      value={form.quantite} onChange={e => setField('quantite', e.target.value)}/>
  </div>
</div>

          {/* Calculs */}
          {surface > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px',
              marginTop:'14px', backgroundColor:'#0d1117', borderRadius:'8px', padding:'12px' }}>
              {[['Surface',`${surface} m²`,'#60a5fa'],['Primitif',`${surfaceP} m²`,'#f59e0b'],
                ['Poids',`${poids} kg`,'#10b981'],['ML',`${ml} m`,'#a78bfa']].map(([lbl,val,col]) => (
                <div key={lbl} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'15px', fontWeight:'700', color:col }}>{val}</div>
                  <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'2px' }}>{lbl}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── FAÇONNAGE CHANT ─── */}
        <div style={S.section}>
          <div style={S.sTitle}>✂️ Façonnage chant</div>

          {/* Boutons en ligne */}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom: form.faconnages.length > 0 ? '16px' : '0' }}>
            {FACONNAGES_CHANT.map(f => {
              const actif = form.faconnages.find(x => x.id === f.id)
              const col   = FACON_COLORS[f.id]
              return (
                <button key={f.id}
                  style={{ ...S.btn(!!actif, col), display:'flex', alignItems:'center', gap:'6px' }}
                  onClick={() => toggleFaconnage(f.id)}>
                  {actif && <span style={{ width:'7px', height:'7px', borderRadius:'50%',
                    backgroundColor: col, display:'inline-block' }}/>}
                  {f.label}
                </button>
              )
            })}
            <button
              style={{ ...S.btn(form.faconnages_speciaux.length > 0, '#8b5cf6'), borderStyle:'dashed' }}
              onClick={() => setModalFaconSpecial(true)}>
              ⚙️ Spécial {form.faconnages_speciaux.length > 0 && `(${form.faconnages_speciaux.length})`}
            </button>
          </div>

          {/* Détail côtés — un bloc par façonnage actif */}
          {form.faconnages.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {form.faconnages.map(f => {
                const def = FACONNAGES_CHANT.find(x => x.id === f.id)
                const col = FACON_COLORS[f.id]
                return (
                  <div key={f.id} style={{ backgroundColor:'#0d1117', borderRadius:'10px',
                    padding:'10px 14px', border:`1px solid ${col}33` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                      <span style={{ ...S.tag(col), minWidth:'56px', textAlign:'center' }}>{def?.label}</span>
                      <span style={{ color:'#4b5563', fontSize:'11px', flex:1 }}>{def?.desc}</span>
                      {/* Côtés individuels — masqués pour Rond */}
{form.forme !== 1 && (
  <div style={{ display:'flex', gap:'4px' }}>
    {['C1','C2','C3','C4'].map(c => (
      <button key={c}
        style={{ ...S.btn(f.cotes.includes(c), col), padding:'4px 9px', fontSize:'11px', fontWeight:'700' }}
        onClick={() => toggleCote(f.id, c)}>
        {c}
      </button>
    ))}
  </div>
)}
                      {def?.hasAngle && (
                        <input style={{ ...S.input, width:'85px' }} type="number"
                          placeholder="Angle °" value={f.angle}
                          onChange={e => setFaconAngle(f.id, e.target.value)}/>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── SÉCURIT ─── */}
        <div style={S.section}>
          <div style={S.sTitle}>🛡️ Sécurit</div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {[['trempe','🔥 Trempe'],['trempe_marquage','🔥🏷 Trempe + Marquage'],
              ['hst','⚡ HST'],['hst_marquage','⚡🏷 HST + Marquage']].map(([k,lbl]) => (
              <button key={k} style={S.btn(form.securit===k)}
                onClick={()=>setField('securit', form.securit===k ? null : k)}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* ─── TRAITEMENTS ─── */}
        <div style={S.section}>
          <div style={S.sTitle}>✨ Traitements</div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            <button style={S.btn(!!form.sablage)} onClick={()=>setModalSablage(true)}>
              🔲 Sablage {form.sablage && <span style={{ marginLeft:'4px', ...S.tag('#60a5fa') }}>{form.sablage.type}</span>}
            </button>
            <button style={S.btn(!!form.gravure)} onClick={()=>setModalGravure(true)}>
              ✏️ Gravure {form.gravure?.fichier && <span style={{ marginLeft:'4px', ...S.tag('#a78bfa') }}>✓</span>}
            </button>
            <button style={S.btn(!!form.laquage)} onClick={()=>setModalLaquage(true)}>
              {form.laquage ? (
                <span style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <span style={{ width:'12px', height:'12px', borderRadius:'3px',
                    backgroundColor:form.laquage.hex_couleur, display:'inline-block' }}/>
                  {form.laquage.code_ral}
                </span>
              ) : '🎨 Laquage'}
            </button>
            <button style={S.btn(form.emballage)}  onClick={()=>setField('emballage',  !form.emballage)}>📦 Emballage</button>
            <button style={S.btn(form.expedition)} onClick={()=>setField('expedition', !form.expedition)}>🚚 Expédition</button>
          </div>
        </div>

        {/* ─── TROUS & ENCOCHES ─── */}
        <div style={S.section}>
          <div style={S.sTitle}>🔧 Trous & Encoches</div>

          {/* TROUS */}
          <div style={{ marginBottom:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
              <span style={{ fontSize:'12px', fontWeight:'700', color:'#60a5fa', letterSpacing:'1px' }}>
                ⭕ TROUS
                {form.trous.length > 0 && <span style={{ ...S.tag(), marginLeft:'8px' }}>{form.trous.length}</span>}
              </span>
              <button style={{ ...S.btn(false), color:'#60a5fa', padding:'5px 12px' }} onClick={addTrou}>+ Ajouter</button>
            </div>
            {form.trous.length === 0
              ? <div style={{ color:'#2d3748', fontSize:'12px', textAlign:'center', padding:'8px 0' }}>Aucun trou</div>
              : form.trous.map((t, i) => (
                <div key={t.id} style={{ backgroundColor:'#080d14', borderRadius:'10px',
                  padding:'12px', marginBottom:'8px', border:'1px solid #1e2a3a' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                    <span style={S.tag()}>Trou {i+1}</span>
                    <button onClick={()=>removeTrou(t.id)}
                      style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'18px' }}>×</button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'8px' }}>
                    {[['diametre','Ø (mm)'],['pos_x','X (mm)'],['pos_y','Y (mm)']].map(([k,lbl]) => (
                      <div key={k}>
                        <label style={S.label}>{lbl}</label>
                        <input style={S.input} type="number" value={t[k]}
                          onChange={e=>updateTrou(t.id,k,e.target.value)}/>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <button style={S.btn(t.fraisage)} onClick={()=>updateTrou(t.id,'fraisage',!t.fraisage)}>Fraisage</button>
                    {t.fraisage && (
                      <input style={{ ...S.input, flex:1 }} type="number" placeholder="Ø fraisage (mm)"
                        value={t.diam_fraisage} onChange={e=>updateTrou(t.id,'diam_fraisage',e.target.value)}/>
                    )}
                  </div>
                </div>
              ))
            }
          </div>

          <div style={{ borderTop:'1px solid #1e2a3a', marginBottom:'20px' }}/>

          {/* ENCOCHES */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
              <span style={{ fontSize:'12px', fontWeight:'700', color:'#a78bfa', letterSpacing:'1px' }}>
                ⬜ ENCOCHES
                {form.encoches.length > 0 && <span style={{ ...S.tag('#a78bfa'), marginLeft:'8px' }}>{form.encoches.length}</span>}
              </span>
              <button style={{ ...S.btn(false), color:'#a78bfa', padding:'5px 12px' }} onClick={addEncoche}>+ Ajouter</button>
            </div>
            {form.encoches.length === 0
              ? <div style={{ color:'#2d3748', fontSize:'12px', textAlign:'center', padding:'8px 0' }}>Aucune encoche</div>
              : form.encoches.map((enc, i) => (
                <div key={enc.id} style={{ backgroundColor:'#080d14', borderRadius:'10px',
                  padding:'12px', marginBottom:'8px', border:'1px solid #1e2a3a' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                    <span style={S.tag('#a78bfa')}>Encoche {i+1}</span>
                    <button onClick={()=>removeEncoche(enc.id)}
                      style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'18px' }}>×</button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'8px' }}>
                    {[['longueur','Long.'],['largeur','Larg.'],['rayon','Rayon'],['position','Pos.']].map(([k,lbl]) => (
                      <div key={k}>
                        <label style={S.label}>{lbl}</label>
                        <input style={S.input} type={k==='position'?'text':'number'} value={enc[k]}
                          onChange={ev=>updateEncoche(enc.id,k,ev.target.value)}/>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* ─── REMARQUE ─── */}
        <div style={S.section}>
          <label style={S.label}>Remarque</label>
          <input style={S.input} placeholder="Note interne..."
            value={form.remarque} onChange={e=>setField('remarque',e.target.value)}/>
        </div>

        {/* ─── POSITIONS ─── */}
        {positions.length > 0 && (
          <div style={S.section}>
            <div style={{ ...S.sTitle, marginBottom:'12px' }}>
              📋 Positions <span style={{ ...S.tag(), marginLeft:'6px' }}>{positions.length}</span>
            </div>
            {positions.map((pos, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'10px 14px', borderRadius:'8px', backgroundColor:'#0d1117',
                border:'1px solid #1e2a3a', marginBottom:'6px' }}>
                <div>
                  <span style={{ ...S.tag(), marginRight:'10px' }}>P{pos.numero}</span>
                  <span style={{ color:'#e6edf3', fontSize:'13px' }}>
                    {pos.matiere} {pos.epaisseur}{pos.epaisseur_type==='simple'?'mm':''} — {pos.longueur}×{pos.largeur}
                  </span>
                </div>
                <span style={{ color:'#6b7280', fontSize:'11px' }}>{pos.surface} m² · {pos.poids} kg</span>
              </div>
            ))}
          </div>
        )}

        {/* ─── BOUTONS ─── */}
        <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', paddingBottom:'32px' }}>
          <button style={S.btnGhost} onClick={ajouterPosition}>+ Position suivante</button>
          <button style={{ ...S.btnPrimary, opacity:(!clientSelectionne||loading)?0.5:1 }}
            onClick={sauvegarder} disabled={loading||!clientSelectionne}>
            {loading ? '...' : saved ? '✓ Enregistré' : `💾 Enregistrer ${typeDoc}`}
          </button>
        </div>
      </div>

      {/* ══ COLONNE DROITE ══ */}
      <div style={{ width:'45%', display:'flex', flexDirection:'column',
        padding:'24px', gap:'16px', backgroundColor:'#080d14', overflowY:'auto' }}>

        <div style={{ ...S.section, backgroundColor:'#111827' }}>
          <div style={S.sTitle}>👁 Aperçu temps réel</div>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <PiecePreview
              forme={form.forme} longueur={form.longueur} largeur={form.largeur}
              epaisseur={form.epaisseur} laquageHex={form.laquage?.hex_couleur}
              faconnages={form.faconnages}
            />
          </div>
          {form.faconnages.length > 0 && (
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'12px', justifyContent:'center' }}>
              {form.faconnages.map(f => (
                <span key={f.id} style={{ ...S.tag(FACON_COLORS[f.id]), fontSize:'10px' }}>
                  {f.id} — {f.cotes.join(' ')}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...S.section, backgroundColor:'#111827' }}>
          <div style={S.sTitle}>📊 Récapitulatif</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {[
              ['Client',        clientSelectionne?.entreprise_nom || '—'],
              ['Document',      `${typeDoc.toUpperCase()} · ${numeroCommande}`],
              ['Matière',       libelleMatiere],
              ['Forme',         FORMES.find(f=>f.id===form.forme)?.label || '—'],
              ['Dim. client',   form.longueur&&form.largeur ? `${form.longueur}×${form.largeur} mm` : '—'],
              ['Dim. primitif', longP&&largP ? `${longP}×${largP} mm` : '—'],
              ['Façonnages',    form.faconnages.map(f=>f.id).join(', ') || '—'],
              ['Sécurit',       form.securit || '—'],
              ['Sablage',       form.sablage?.type || '—'],
              ['Laquage',       form.laquage ? `${form.laquage.code_ral} F${form.laquage.face}` : '—'],
              ['Trous',         form.trous.length    || '—'],
              ['Encoches',      form.encoches.length || '—'],
              ['Positions',     positions.length],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ display:'flex', justifyContent:'space-between', fontSize:'12px' }}>
                <span style={{ color:'#6b7280' }}>{lbl}</span>
                <span style={{ color:'#e6edf3', fontWeight:'600' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
