// client/src/components/layout/Alert.js
import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useAlert } from '../../context/AlertContext';

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const variantStyles = {
  success: css`
    background-color: ${props => props.theme.colors.success};
    color: ${props => props.theme.colors.white};
  `,
  danger: css`
    background-color: ${props => props.theme.colors.danger};
    color: ${props => props.theme.colors.white};
  `,
  warning: css`
    background-color: ${props => props.theme.colors.warning};
    color: ${props => props.theme.colors.dark};
  `,
  info: css`
    background-color: ${props => props.theme.colors.info};
    color: ${props => props.theme.colors.white};
  `
};

const AlertWrapper = styled.div`
  position: fixed;
  top: 70px;
  right: ${props => props.theme.spacing.md};
  z-index: ${props => props.theme.zIndex.popover};
  animation: ${slideIn} 0.3s ease-out;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    right: ${props => props.theme.spacing.sm};
    left: ${props => props.theme.spacing.sm};
  }
`;

const AlertBox = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  min-width: 300px;
  max-width: 500px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  ${props => variantStyles[props.type || 'info']}
`;

const AlertIcon = styled.i`
  font-size: ${props => props.theme.typography.fontSize.xl};
`;

const AlertMessage = styled.span`
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: ${props => props.theme.typography.fontSize.xl};
  cursor: pointer;
  padding: 0;
  opacity: 0.8;
  transition: opacity ${props => props.theme.transitions.fast};
  
  &:hover {
    opacity: 1;
  }
`;

function Alert() {
  const { alert, setAlert } = useAlert();
  
  if (!alert) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'danger': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-info-circle';
    }
  };

  return (
    <AlertWrapper>
      <AlertBox type={alert.type}>
        <AlertIcon className={getIcon(alert.type)} />
        <AlertMessage>{alert.message}</AlertMessage>
        <CloseButton onClick={() => setAlert(null)}>
          <i className="fas fa-times" />
        </CloseButton>
      </AlertBox>
    </AlertWrapper>
  );
}

export default Alert;