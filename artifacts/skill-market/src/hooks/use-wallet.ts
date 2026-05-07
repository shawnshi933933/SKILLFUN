import { useState, useEffect } from "react";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem("wallet_address");
    if (saved) setAddress(saved);
  }, []);

  const connect = () => {
    const mockAddress = "0x" + Math.random().toString(16).slice(2, 42);
    setAddress(mockAddress);
    localStorage.setItem("wallet_address", mockAddress);
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem("wallet_address");
  };

  return { address, connect, disconnect };
}