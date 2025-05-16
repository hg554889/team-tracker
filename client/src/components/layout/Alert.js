// client/src/components/layout/Alert.js

import React, { useContext } from 'react';
import AlertContext from '../../context/AlertContext';
import styled from 'styled-components';

const AlertWrapper = styled.div`
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 1050;
  width: 300px;
`;

const AlertItem = styled.div`
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &.alert-success {
    background-color: #d4edda;
    color: #155724;
    border-left: 5px solid #28a745;
  }
  
  &.alert-danger {
    background-color: #f8d7da;
    color: #721c24;
    border-left: 5px solid #dc3545;
  }
  
  &.alert-warning {
    background-color: #fff3cd;
    color: #856404;
    border-left: 5px solid #ffc107;
  }
  
  &.alert-info {
    background-color: #d1ecf1;
    color: #0c5460;
    border-left: 5px solid #17a2b8;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
`;

const Alert = () => {
  const { alerts, removeAlert } = useContext(AlertContext);
  
  if (alerts.length === 0) {
    return null;
  }

  return (
    <AlertWrapper>
      {alerts.map((alert) => (
        <AlertItem key={alert.id} className={`alert-${alert.type}`}>
          <span>{alert.msg}</span>
          <CloseButton onClick={() => removeAlert(alert.id)}>
            <i className="fas fa-times"></i>
          </CloseButton>
        </AlertItem>
      ))}
    </AlertWrapper>
  );
};

export default Alert;