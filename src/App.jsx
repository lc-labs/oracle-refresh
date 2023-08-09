import './App.css'
import { useState } from 'react'
import './oracleScript'

function App() {
  const [rpc, setRpc] = useState(import.meta.env.VITE_TENDERLY_URL || '')

  const handleRefresh = async () => {
    const oracleCli = await window.__reserveDevTools(rpc)
    await oracleCli.makeAllPricesRecent()
    alert('Oracles updated!')
  }

  return (
    <>
      <h1>Update oracles</h1>
      <div className="card">
        <label>Tenderly RPC Url</label>
        <br />
        <input
          value={rpc}
          onChange={(e) => setRpc(e.target.value)}
          style={{ width: 420, textAlign: 'center' }}
        />
        <br />
        <br />
        <button onClick={handleRefresh}>Refresh oracles!</button>
      </div>
    </>
  )
}

export default App
