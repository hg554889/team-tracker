import React from 'react';

function MemberList({ members, onRemove, canRemove }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {members.map((m) => (
        <li key={m._id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ flex: 1 }}>{m.name} <span style={{ color: '#888', fontSize: 13 }}>({m.email})</span></span>
          <span style={{ marginRight: 12, color: '#aaa', fontSize: 13 }}>{m.role || ''}</span>
          {canRemove && (
            <button className="btn btn-sm btn-danger" onClick={() => onRemove(m._id)}>제거</button>
          )}
        </li>
      ))}
    </ul>
  );
}

export default MemberList; 