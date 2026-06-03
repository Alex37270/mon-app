import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'

// Pages modules
import Dashboard from './modules/dashboard/Dashboard'
import Commerce from './modules/commerce/Commerce'
import Production from './modules/production/Production'
import Stock from './modules/stock/Stock'
import Logistique from './modules/logistique/Logistique'
import Qualite from './modules/qualite/Qualite'
import Maintenance from './modules/maintenance/Maintenance'
import Pilotage from './modules/pilotage/Pilotage'
import Administration from './modules/administration/Administration'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/commerce" element={<Commerce />} />
        <Route path="/production" element={<Production />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/logistique" element={<Logistique />} />
        <Route path="/qualite" element={<Qualite />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/pilotage" element={<Pilotage />} />
        <Route path="/administration" element={<Administration />} />
      </Routes>
    </Layout>
  )
}
