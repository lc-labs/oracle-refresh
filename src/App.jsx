/* eslint-disable react/prop-types */
import './App.css'
import { useState } from 'react'
import { ethers } from 'ethers'
import './oracleScript'

const LOADING = 'Loading...'

// Modify this array for different tokens
const tokens = [
  '0x320623b8E4fF03373931769A31Fc52A4E78B5d70', // RSR
  '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x4Fabb145d64652a948d72533023f6E7A623C7C53', // BUSD
  '0x8E870D67F660D95d5be530380D0eC0bd388289E1', // USDP

  // '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', // cDAI
  // '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // cUSDC
  // '0x041171993284df560249B57358F931D9eB7b925D', // cUSDP
  // '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5', // cETH
  // '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4', // cWBTC
  // '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  // '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  // '0xC581b735A1688071A1746c968e0798D642EDE491', // EURT
  // '0x465a5a630482f3abD6d3b84B39B29b07214d19e5', // fUSDC
  // '0x81994b9607e06ab3d5cF3AffF9a67374f05F27d7', // fUSDT
  // '0xe2bA8693cE7474900A045757fe0efCa900F6530b', // fDAI
  // '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', // wstETH
  // '0xae78736Cd615f374D3085123A210448E74Fc6393', // rETH
  // RTOKENS
  // '0x196f4727526eA7FB1e17b2071B3d8eAA38486988', // RSV
  // '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F', // eUSD
  // '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8', // eth+
  // '0xaCdf0DBA4B9839b96221a8487e9ca660a48212be', // hyUSD
]

const Actions = ({ rpc }) => {
  const [status, setStatus] = useState('')
  const [blocks, setBlocks] = useState('10')
  const [account, setAccount] = useState('0x89eeA190083fD02c5bfE75E6dDaBF957F4bfFfc4')

  const handleRefresh = async () => {
    try {
      setStatus(LOADING)
      const oracleCli = await window.__reserveDevTools(rpc)
      await oracleCli.makeAllPricesRecent()
      setStatus('Oracles updated!')
    } catch (e) {
      setStatus('Error updating oracles')
      console.error('Error updating oracles', e)
    }
  }

  const handleFund = async () => {
    try {
      setStatus(LOADING)
      const provider = new ethers.providers.JsonRpcProvider(rpc)
      const amount = '0x21e19e0c9bab2400000'
      // const resp = await provider.send('tenderly_setErc20Balance', [
      //   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      //   '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      //   amount,
      // ])
      // console.log('response', resp)
      await Promise.all(
        tokens.map((token) => provider.send('tenderly_setErc20Balance', [token, account, amount]))
      )
      setStatus('Balances added to account!')
    } catch (e) {
      setStatus('Error funding account')
      console.error('Error funding account', e)
    }
  }

  const handleChangeBlock = async () => {
    try {
      setStatus(LOADING)
      const provider = new ethers.providers.JsonRpcProvider(rpc)

      await provider.send('evm_increaseBlocks', [
        ethers.utils.hexValue(+blocks), // hex encoded number of blocks to increase
      ])
      setStatus('Blocks advanced!')
    } catch (e) {
      console.error('next', e)
    }
  }

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <h3 className="mb-1">Fork actions</h3>
      <button className="mb-1" disabled={status === LOADING} onClick={handleRefresh}>
        Refresh oracles!
      </button>
      <hr />
      <div className="mt-1">
        <label>Advance blocks</label>
        <input
          placeholder="Number of blocks to advance"
          value={blocks}
          type="number"
          onChange={(e) => setBlocks(e.target.value)}
        />
      </div>
      <button className="mt-1" disabled={status === LOADING} onClick={handleChangeBlock}>
        Advance blocks
      </button>
      <hr />
      <div className="mt-1">
        <label>Fund account</label>
        <input
          placeholder="Account address"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
      </div>
      <button className="mt-1" disabled={status === LOADING} onClick={handleFund}>
        Add funds
      </button>

      {!!status && <div className="mt-1">{status}</div>}
    </div>
  )
}

const TENDERLY_USER = 'Reserveslug'
const TENDERLY_PROJECT = 'testnet'

const CreateFork = ({ accessKey }) => {
  const [msg, setMsg] = useState('')

  const handleCreate = async () => {
    setMsg('Loading...')
    const result = await fetch(
      `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/fork`,
      {
        method: 'POST',
        body: JSON.stringify({
          network_id: '1', // network you wish to fork
          chain_config: {
            chain_id: 3, // chain_id used in the forked environment
          },
        }),
        headers: {
          'X-Access-Key': accessKey,
          'Content-type': 'application/json; charset=UTF-8',
        },
      }
    ).then((response) => response.json())
    const rpc = `https://rpc.tenderly.co/fork/${result.simulation_fork.id}`

    setMsg(`Fork created!: ${rpc}`)
  }

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <h3 className="mb-1">Create fork</h3>
      <button onClick={handleCreate}>Create fork</button>
      {!!msg && <div className="mt-1">{msg}</div>}
    </div>
  )
}

function App() {
  const [rpc, setRpc] = useState(import.meta.env.VITE_TENDERLY_URL || '')
  const [accessKey, setAccessKey] = useState(import.meta.env.VITE_TENDERLY_KEY || '')

  return (
    <>
      <div className="card">
        <h3 className="mb-1">Setup</h3>
        <div>
          <label>Tenderly RPC Url</label>
          <input
            value={rpc}
            onChange={(e) => setRpc(e.target.value)}
            placeholder="Input rpc"
            style={{ width: 420, textAlign: 'center' }}
          />
        </div>
        <div className="mt-1">
          <label>Access key</label>
          <input
            type="password"
            placeholder="Input access key"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
          />
        </div>
      </div>
      <CreateFork accessKey={accessKey} />
      <Actions rpc={rpc} />
    </>
  )
}

export default App
