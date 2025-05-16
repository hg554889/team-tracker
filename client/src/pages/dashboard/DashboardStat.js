// client/src/pages/dashboard/DashboardStat.js

import React from 'react';
import styled from 'styled-components';

const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: ${props => `${props.color}10`};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
`;

const StatTitle = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const DashboardStat = ({ title, value, icon, color }) => {
  return (
    <StatCard>
      <IconContainer color={color}>
        <i className={`fas fa-${icon}`}></i>
      </IconContainer>
      <StatContent>
        <StatValue>{value}</StatValue>
        <StatTitle>{title}</StatTitle>
      </StatContent>
    </StatCard>
  );
};

export default DashboardStat;