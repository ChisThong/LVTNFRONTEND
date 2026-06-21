import { createContext, useState, useEffect, useContext } from 'react';
import walletApi from '../api/walletApi';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const res = await walletApi.getWallet();
      if (res.data?.data) {
        setWallet(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      setWallet(null);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchWallet();
    } else {
      setWalletLoading(false);
    }

    const handleAuthChange = () => {
      if (localStorage.getItem('token')) {
        fetchWallet();
      } else {
        setWallet(null);
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, setWallet, walletLoading, fetchWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
