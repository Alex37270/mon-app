import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const OPERATIONS = ['Découpe', 'Façonnage', 'Façonnage Forme', 'Façonnage Spécial', 'Chanfrein', 'Perçage', 'Encoches', 'Trempe', 'Laquage', 'Emballage', 'Expédition']

function App() {
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [operationInput, setOperationInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [newCommande, setNewCommande] = useState({
    Numero_Commande: '',
    Position: 1,
    Client_Nom: '',
    Client_Reference: '',
    Matiere: '',
    Epaisseur: '',
    Dimensions_Longueur: '',
    Dimensions_Largeur: '',
    Surface: '',
    Poids: '',
    Opérations: '',
    Date_Expedition: '',
    Statut_Global: 'En attente',
    created_at: new Date().toISOString()
  })

  useEffect(() => { fetchCommandes() }, [])

  async function fetchCommandes() {
    const { data, error } = await supabase.from('Commandes').select('*')
    if (!error) setCommandes(data)
    setLoading(false)
  }

  async function ajouterCommande() {
    const { error } = await supabase.from('Commandes').insert([newCommande])
    if (!error) {
      setShowForm(false)
      resetForm()
      fetchCommandes()
    } else {
      console.log('Erreur:', error)
    }
  }

  function resetForm() {
    setNewCommande({
      Numero_Commande: '', Position: 1, Client_Nom: '', Client_Reference: '',
      Matiere: '', Epaisseur: '', Dimensions_Longueur: '', Dimensions_Largeur: '',
      Surface: '', Poids: '', Opérations: '', Date_Expedition: '',
      Statut_Global: 'En attente', created_at: new Date().toISOString()
    })
    setOperationInput('')
  }

  function calculerSurfacePoids(longueur, largeur, epaisseur) {
    const l = parseFloat(longueur) || 0
    const la = parseFloat(largeur) || 0
    const e = parseFloat(epaisseur) || 0
    const surface = (l * la) / 1000000
    const poids = surface * e * 2.5
    return {
      Surface: surface.toFixed(3),
      Poids: poids.toFixed(2)
    }
  }

  function handleDimension(field, value) {
    const updated = { ...newCommande, [field]: value }
    const calc = calculerSurfacePoids(
      field === 'Dimensions_Longueur' ? value : newCommande.Dimensions_Longueur,
      field === 'Dimensions_Largeur' ? value : newCommande.Dimensions_Largeur,
      newCommande.Epaisseur
    )
    setNewCommande({ ...updated, ...calc })
  }

  function handleEpaisseur(value) {
    const calc = calculerSurfacePoids(newCommande.Dimensions_Longueur, newCommande.Dimensions_Largeur, value)
    setNewCommande({ ...newCommande, Epaisseur: value, ...calc })
  }

  function handleOperationInput(value) {
    setOperationInput(value)
    if (value.length > 0) {
      setSuggestions(OPERATIONS.filter(op => op.toLowerCase().includes(value.toLowerCase())))
    } else {
      setSuggestions([])
    }
  }

  function selectOperation(op) {
    const current = newCommande.Opérations
    const updated = current ? current + ', ' + op : op
    setNewCommande({ ...newCommande, Opérations: updated })
    setOperationInput('')
    setSuggestions([])
  }

  const statutColor = (s) => {
    if (s === 'Expédiée') return { bg: '#86efac', color: '#14532d' }
    if (s === 'En cours') return { bg: '#93c5fd', color: '#1e3a8a' }
    if (s === 'Urgent') return { bg: '#fca5a5', color: '#7f1d1d' }
    return { bg: '#fde68a', color: '#713f12' }
  }

  const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px'
  }
  const labelStyle = {
    display: 'block', marginBottom: '6px',
    fontWeight: '600', color: '#374151', fontSize: '13px'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#1e40af', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '20px' }}>📋 Module Commerce — Commandes</h1>
        <button onClick={() => setShowForm(!showForm)} style={{
          backgroundColor: 'white', color: '#1e40af',
          padding: '10px 20px', border: 'none', borderRadius: '8px',
          cursor: 'pointer', fontWeight: 'bold'
        }}>
          {showForm ? '✕ Fermer' : '+ Nouvelle commande'}
        </button>
      </div>

      <div style={{ padding: '24px 32px' }}>

        {/* Formulaire */}
        {showForm && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, color: '#1e40af', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px' }}>
              Nouvelle commande
            </h2>

            {/* Infos commande */}
            <p style={{ fontWeight: '700', color: '#374151', marginBottom: '12px' }}>📌 Informations commande</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>N° Commande</label>
                <input style={inputStyle} placeholder="ex: 1198001"
                  value={newCommande.Numero_Commande}
                  onChange={e => setNewCommande({...newCommande, Numero_Commande: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Position</label>
                <input style={inputStyle} type="number" placeholder="1"
                  value={newCommande.Position}
                  onChange={e => setNewCommande({...newCommande, Position: parseInt(e.target.value)})} />
              </div>
              <div>
                <label style={labelStyle}>Statut</label>
                <select style={inputStyle} value={newCommande.Statut_Global}
                  onChange={e => setNewCommande({...newCommande, Statut_Global: e.target.value})}>
                  <option>En attente</option>
                  <option>En cours</option>
                  <option>Expédiée</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Client</label>
                <input style={inputStyle} placeholder="Nom du client"
                  value={newCommande.Client_Nom}
                  onChange={e => setNewCommande({...newCommande, Client_Nom: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Référence client</label>
                <input style={inputStyle} placeholder="Référence"
                  value={newCommande.Client_Reference}
                  onChange={e => setNewCommande({...newCommande, Client_Reference: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Date expédition</label>
                <input style={inputStyle} type="date"
                  value={newCommande.Date_Expedition}
                  onChange={e => setNewCommande({...newCommande, Date_Expedition: e.target.value})} />
              </div>
            </div>

            {/* Matière & Dimensions */}
            <p style={{ fontWeight: '700', color: '#374151', marginBottom: '12px' }}>📐 Matière & Dimensions (mm)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Matière</label>
                <input style={inputStyle} placeholder="ex: Verre clair"
                  value={newCommande.Matiere}
                  onChange={e => setNewCommande({...newCommande, Matiere: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Épaisseur (mm)</label>
                <input style={inputStyle} type="number" placeholder="ex: 6"
                  value={newCommande.Epaisseur}
                  onChange={e => handleEpaisseur(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Longueur (mm)</label>
                <input style={inputStyle} type="number" placeholder="ex: 1000"
                  value={newCommande.Dimensions_Longueur}
                  onChange={e => handleDimension('Dimensions_Longueur', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Largeur (mm)</label>
                <input style={inputStyle} type="number" placeholder="ex: 500"
                  value={newCommande.Dimensions_Largeur}
                  onChange={e => handleDimension('Dimensions_Largeur', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Surface (m²)</label>
                <input style={{...inputStyle, backgroundColor: '#f9fafb', color: '#6b7280'}}
                  value={newCommande.Surface} readOnly placeholder="Calculé auto" />
              </div>
              <div>
                <label style={labelStyle}>Poids (kg)</label>
                <input style={{...inputStyle, backgroundColor: '#f9fafb', color: '#6b7280'}}
                  value={newCommande.Poids} readOnly placeholder="Calculé auto" />
              </div>
            </div>

            {/* Opérations */}
            <p style={{ fontWeight: '700', color: '#374151', marginBottom: '12px' }}>⚙️ Opérations</p>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <input style={inputStyle} placeholder="Tapez pour chercher une opération..."
                  value={operationInput}
                  onChange={e => handleOperationInput(e.target.value)} />
                {suggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {suggestions.map(op => (
                      <div key={op} onClick={() => selectOperation(op)}
                        style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={e => e.target.style.backgroundColor = '#f0f9ff'}
                        onMouseLeave={e => e.target.style.backgroundColor = 'white'}>
                        {op}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {newCommande.Opérations && (
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {newCommande.Opérations.split(', ').map((op, i) => (
                    <span key={i} style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                      {op}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={ajouterCommande} style={{
                backgroundColor: '#16a34a', color: 'white',
                padding: '12px 28px', border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '15px'
              }}>✅ Enregistrer</button>
              <button onClick={() => { setShowForm(false); resetForm() }} style={{
                backgroundColor: '#dc2626', color: 'white',
                padding: '12px 28px', border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '15px'
              }}>❌ Annuler</button>
            </div>
          </div>
        )}

        {/* Tableau */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: '#111827' }}>
              Commandes <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 'normal' }}>({commandes.length})</span>
            </h2>
          </div>
          {loading ? (
            <p style={{ padding: '24px', color: '#6b7280' }}>Chargement...</p>
          ) : commandes.length === 0 ? (
            <p style={{ padding: '24px', color: '#6b7280' }}>Aucune commande</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  {['N°', 'Pos', 'Client', 'Matière', 'Ép.', 'Surface', 'Poids', 'Opérations', 'Expédition', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commandes.map((cmd) => {
                  const sc = statutColor(cmd.Statut_Global)
                  return (
                    <tr key={cmd.id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1e40af' }}>{cmd.Numero_Commande}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{cmd.Position}</td>
                      <td style={{ padding: '12px 16px' }}>{cmd.Client_Nom}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{cmd.Matiere}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{cmd.Epaisseur}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{cmd.Surface}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{cmd.Poids}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#374151' }}>{cmd.Operations}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{cmd.Date_Expedition}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ backgroundColor: sc.bg, color: sc.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                          {cmd.Statut_Global || 'En attente'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
