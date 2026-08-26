import { createContext, useContext, useEffect, useState } from 'react';
import { getProfile } from '../api';

const CurrencyContext = createContext({ currency: 'MGA', setCurrency: () => {} });

// Fetches the user's saved currency once and shares it with every
// descendant, so changing it in one place (CurrencySettings) instantly
// updates every amount shown elsewhere without each component re-fetching
// the profile independently.
export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('MGA');

  useEffect(() => {
    getProfile()
      .then((profile) => {
        if (profile.currency) setCurrency(profile.currency);
      })
      .catch(() => {});
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- small context, splitting into two files isn't worth it
export function useCurrency() {
  return useContext(CurrencyContext);
}
