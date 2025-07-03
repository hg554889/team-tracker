// client/src/components/layout/Spinner.js
import React from 'react';

function Spinner({ size = 'md' }) {
  const px = size === 'sm' ? 16 : size === 'lg' ? 48 : 32;
  return (
    <div style={{ display: 'inline-block', width: px, height: px }}>
      <svg viewBox="0 0 50 50" style={{ width: '100%', height: '100%' }}>
        <circle cx="25" cy="25" r="20" fill="none" stroke="#888" strokeWidth="5" strokeDasharray="90,150" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

export default Spinner;