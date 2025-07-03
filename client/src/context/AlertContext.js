// client/src/context/AlertContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alert, setAlertState] = useState(null);

  const setAlert = useCallback((message, type = 'success', timeout = 2500) => {
    setAlertState({ message, type });
    setTimeout(() => setAlertState(null), timeout);
  }, []);

  return (
    <AlertContext.Provider value={{ alert, setAlert }}>
      {children}
    </AlertContext.Provider>
  );
};