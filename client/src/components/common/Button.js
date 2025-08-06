import styled, { css } from 'styled-components';

const sizeStyles = {
  sm: css`
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.typography.fontSize.sm};
  `,
  md: css`
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    font-size: ${props => props.theme.typography.fontSize.base};
  `,
  lg: css`
    padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
    font-size: ${props => props.theme.typography.fontSize.lg};
  `
};

const variantStyles = {
  primary: css`
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.white};
    border: 1px solid ${props => props.theme.colors.primary};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.primaryDark};
      border-color: ${props => props.theme.colors.primaryDark};
    }
  `,
  secondary: css`
    background-color: ${props => props.theme.colors.secondary};
    color: ${props => props.theme.colors.white};
    border: 1px solid ${props => props.theme.colors.secondary};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.gray[700]};
      border-color: ${props => props.theme.colors.gray[700]};
    }
  `,
  success: css`
    background-color: ${props => props.theme.colors.success};
    color: ${props => props.theme.colors.white};
    border: 1px solid ${props => props.theme.colors.success};
    
    &:hover:not(:disabled) {
      background-color: #218838;
      border-color: #1e7e34;
    }
  `,
  danger: css`
    background-color: ${props => props.theme.colors.danger};
    color: ${props => props.theme.colors.white};
    border: 1px solid ${props => props.theme.colors.danger};
    
    &:hover:not(:disabled) {
      background-color: #c82333;
      border-color: #bd2130;
    }
  `,
  outline: css`
    background-color: transparent;
    color: ${props => props.theme.colors.primary};
    border: 1px solid ${props => props.theme.colors.primary};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.primary};
      color: ${props => props.theme.colors.white};
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${props => props.theme.colors.text.primary};
    border: 1px solid transparent;
    
    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.gray[100]};
    }
  `
};

export const Button = styled.button`
  display: ${props => props.block ? 'block' : 'inline-block'};
  width: ${props => props.block ? '100%' : 'auto'};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border-radius: ${props => props.theme.borderRadius.base};
  transition: all ${props => props.theme.transitions.base};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  ${props => sizeStyles[props.size || 'md']}
  ${props => variantStyles[props.variant || 'primary']}
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}33;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${props => props.loading && css`
    color: transparent;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin-left: -8px;
      margin-top: -8px;
      border: 2px solid #ffffff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }
  `}

  ${props => props.icon && css`
    display: inline-flex;
    align-items: center;
    gap: ${props.theme.spacing.sm};
  `}
`;

export const ButtonGroup = styled.div`
  display: inline-flex;
  gap: ${props => props.theme.spacing.sm};
  
  ${Button} {
    &:not(:first-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    
    &:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
`;