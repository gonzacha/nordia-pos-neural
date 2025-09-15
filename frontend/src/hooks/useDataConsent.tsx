import { createContext, useContext, ReactNode } from 'react';

const DataConsentContext = createContext({});

export function DataConsentProvider({ children }: { children: ReactNode }) {
  return (
    <DataConsentContext.Provider value={{}}>
      {children}
    </DataConsentContext.Provider>
  );
}

export function useDataConsent() {
  return { consent: true };
}