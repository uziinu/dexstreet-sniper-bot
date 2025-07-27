import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [mode, setMode] = useState('AI');
  const [chain, setChain] = useState('ETH');
  const [amount, setAmount] = useState('0.01');
  const [contract, setContract] = useState('');
  const [priority, setPriority] = useState('0.001');
  const [slippage, setSlippage] = useState('20');
  const [bribe, setBribe] = useState('0.05');
  const [priceInfo, setPriceInfo] = useState({});
  const [flashbotsStatus, setFlashbotsStatus] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
    } else {
      alert("Please install MetaMask!");
    }
  };

  const fetchPrice = async () => {
    if (contract && chain) {
      const res = await fetch(`http://localhost:3001/price-check?tokenAddress=${contract}&chain=${chain}`);
      const data = await res.json();
      setPriceInfo(data);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, [contract, chain]);

  const snipeNow = async () => {
    const res = await fetch('http://localhost:3001/snipe/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chain,
        targetContract: contract,
        amount,
        slippage,
        gasPriority: priority,
        bribe,
        walletAddress: 'Injected'
      })
    });
    const data = await res.json();
    alert('Snipe Executed: ' + JSON.stringify(data));
  };

  return (
    <div className="app">
      <h1>DEXSTREET Sniper Bot</h1>
      <button onClick={connectWallet} className="connect">
        {walletConnected ? "✅ Wallet Connected" : "🔌 Connect Wallet"}
      </button>
      <div className="card">
        <input placeholder="Target Contract Address" value={contract} onChange={e => setContract(e.target.value)} />
        <select value={chain} onChange={e => setChain(e.target.value)}>
          <option value="ETH">Ethereum</option>
          <option value="BSC">BSC</option>
          <option value="BASE">Base</option>
          <option value="ARB">Arbitrum</option>
          <option value="SOL">Solana</option>
          <option value="SUI">Sui</option>
        </select>
        <div className="grid">
          <input placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          <input placeholder="Priority Fee" value={priority} onChange={e => setPriority(e.target.value)} />
          <input placeholder="Slippage %" value={slippage} onChange={e => setSlippage(e.target.value)} />
          <input placeholder="Bribe" value={bribe} onChange={e => setBribe(e.target.value)} />
        </div>
        <div className="priceInfo">
          <p>💰 Price: {priceInfo.price}</p>
          <p>⛽ Gas: {priceInfo.estGas}</p>
          <p>📉 Tax: {priceInfo.estTax}</p>
        </div>
        <div className="toggle">
          <button onClick={() => setMode('AI')} className={mode === 'AI' ? 'active' : ''}>AI Mode</button>
          <button onClick={() => setMode('Static')} className={mode === 'Static' ? 'active' : ''}>Static Mode</button>
        </div>
        <button onClick={snipeNow} className="snipe">SNIPE NOW</button>
      </div>
    </div>
  );
}

export default App;
