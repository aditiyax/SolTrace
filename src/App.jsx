import { useState } from 'react';
import React, { useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import './App.css';

export default function App() {
  return (
    <main>
      <SolanaTransactions />
    </main>
  );
}

const SolanaTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [inputAddress, setInputAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (walletAddress) {
        setLoading(true);
        const connection = new Connection('https://api.devnet.solana.com');
        const pubKey = new PublicKey(walletAddress);

        try {
          const signatures = await connection.getSignaturesForAddress(pubKey, {
            limit: 10,
          });
          const txs = await Promise.all(
            signatures.map((sig) => connection.getTransaction(sig.signature))
          );
          setTransactions(txs.filter((tx) => tx !== null));
        } catch (error) {
          console.error(`Error fetching Transaction logs: ${error}`);
        }
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [walletAddress]);

  const getTransactionAmount = (tx) => {
    let totalAmount = 0;
    if (tx?.meta?.postBalances && tx?.meta?.preBalances) {
      totalAmount = tx.meta.preBalances[0] - tx.meta.postBalances[0]; // Calculate the amount in lamports
    }
    return totalAmount / 1000000000; // Convert lamports to SOL
  };

  const handleFetchTransactions = () => {
    setWalletAddress(inputAddress); // Trigger fetching transactions for the input address
  };

  return (
    <div margin>
      <h2> Fetch your Solana wallet's Transactions over Devnet Below ↓</h2>
      <input
    type="text"
    className="wallet-input"
    placeholder="Enter Solana Wallet Address"
    value={inputAddress}
    onChange={(e) => setInputAddress(e.target.value)}
    style={{ marginRight: '23px' }}
  />
  <button className="fetch-button" onClick={handleFetchTransactions}>
    Fetch Transactions
  </button>
  
      
      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <div>
          <h2>Latest Transactions:</h2>
          <ul>
            {transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <li key={index}>
                  <p>Transaction {index + 1}: {tx.transaction.signatures[0]}</p>
                  <p>Amount: {getTransactionAmount(tx)} SOL</p>
                  <a 
                    href={`https://solscan.io/tx/${tx.transaction.signatures[0]}?cluster=devnet`}
                    target="_blank" 
                    rel="noopener noreferrer">
                    View on Explorer
                  </a>
                </li>
              ))
            ) : (
              <p>No transactions found for this wallet.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
