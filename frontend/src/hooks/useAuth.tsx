import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Demo User',
    role: 'admin'
  });

  const login = async (email: string, password: string) => {
    // Demo login
    setUser({ id: '1', name: 'Demo User', role: 'admin' });
  };

  const logout = () => {
    setUser(null);
  };

  return { user, login, logout };
}