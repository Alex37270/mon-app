import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function App() {
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newCommande, setNewCommande] = useState({
    Numero_Commande: '',
    Client_Nom: '',
    Matiere: '',
    Date_Expedition: '',
    Statut_Global: 'En attente',
    created_at: new Date().toISOString()
  })

  useEffect(() => {
    fetchCommandes()
  }, [])

  async function fetchCommandes() {
    const { data, error } = await supabase
      .from('Commandes')
      .select('*')
    if (error) {
      console.log('Erreur:', error)
    } else {
      setCommandes(data)
    }
    setLoading(false)
  }

  async function ajouterCommande() {
    const { error } = await supabase
      .from('Commandes')
      .insert([newCommande])
    if (error) {
      console.log('Erreur:', error)
    } else {
      setShowForm(false)
      setNewCommande({
        Numero_Commande: '',
        Client_Nom: '',
        Matiere: '',
        Date_Expedition: '',
        Statut_Global: 'En attente'
      })
      fetchCommandes()
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>📋 Module Commerce - Commandes</h1>

      <button onClick={() => setShowForm(true)} style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '20px'
      }}>
        + Nouvelle commande
      </button>

      {showForm && (
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <h2>Nouvelle commande</h2>

          <div style={{ marginBottom: '10px' }}>
            <label>N° Commande</label><br/>
            <input
              value={newCommande.Numero_Commande}
              onChange={(e) => setNewCommande({...newCommande, Numero_Commande: e.target.value})}
              style={{ padding: '8px', width: '300px', marginTop: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Client</label><br/>
            <input
              value={newCommande.Client_Nom}
              onChange={(e) => setNewCommande({...newCommande, Client_Nom: e.target.value})}
              style={{ padding: '8px', width: '300px', marginTop: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Matière</label><br/>
            <input
              value={newCommande.Matiere}
              onChange={(e) => setNewCommande({...newCommande, Matiere: e.target.value})}
              style={{ padding: '8px', width: '300px', marginTop: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Date Expédition</label><br/>
            <input
              type="date"
              value={newCommande.Date_Expedition}
              onChange={(e) => setNewCommande({...newCommande, Date_Expedition: e.target.value})}
              style={{ padding: '8px', width: '300px', marginTop: '4px' }}
            />
          </div>

          <div style={{ marginTop: '15px' }}>
            <button onClick={ajouterCommande} style={{
              backgroundColor: '#16a34a',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '10px'
            }}>
              ✅ Enregistrer
            </button>
            <button onClick={() => setShowForm(false)} style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              ❌ Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : commandes.length === 0 ? (
        <p>Aucune commande pour l'instant</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>N° Commande</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Client</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Matière</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Date expédition</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((cmd) => (
              <tr key={cmd.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>{cmd.Numero_Commande}</td>
                <td style={{ padding: '12px' }}>{cmd.Client_Nom}</td>
                <td style={{ padding: '12px' }}>{cmd.Matiere}</td>
                <td style={{ padding: '12px' }}>{cmd.Date_Expedition}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    backgroundColor: cmd.Statut_Global === 'Expédiée' ? '#86efac' :
                                     cmd.Statut_Global === 'En cours' ? '#93c5fd' : '#fde68a',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '13px'
                  }}>
                    {cmd.Statut_Global || 'En attente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App
