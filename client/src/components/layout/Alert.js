// client/src/components/layout/Alert.js
import React from 'react';
import { useAlert } from '../../context/AlertContext';

function Alert() {
  const { alert } = useAlert();
  if (!alert) return null;
  const bg = alert.type === 'danger' ? '#ffdddd' : alert.type === 'info' ? '#ddeeff' : alert.type === 'warning' ? '#fff7cc' : '#ddffdd';
  return (
    <div style={{ background: bg, color: '#222', padding: 12, marginBottom: 16, borderRadius: 4, border: '1px solid #ccc', fontWeight: 500 }}>
      {alert.message}
    </div>
  );
}

export default Alert;