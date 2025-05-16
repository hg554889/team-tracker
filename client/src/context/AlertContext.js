// client/src/context/AlertContext.js

import React, { createContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // 알림 추가
  const setAlert = (msg, type = 'danger', timeout = 5000) => {
    const id = uuidv4();
    
    setAlerts([...alerts, { id, msg, type }]);

    // 알림 자동 제거
    setTimeout(() => removeAlert(id), timeout);
    
    return id;
  };

  // 알림 제거
  const removeAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        setAlert,
        removeAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;