import styled, { css } from 'styled-components';

const variantStyles = {
  primary: css`
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.white};
  `,
  secondary: css`
    background-color: ${props => props.theme.colors.secondary};
    color: ${props => props.theme.colors.white};
  `,
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
  `,
  light: css`
    background-color: ${props => props.theme.colors.gray[200]};
    color: ${props => props.theme.colors.text.primary};
  `,
  dark: css`
    background-color: ${props => props.theme.colors.dark};
    color: ${props => props.theme.colors.white};
  `
};

export const Badge = styled.span`
  display: inline-block;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  font-size: ${props => props.pill ? props.theme.typography.fontSize.xs : props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: ${props => props.pill ? props.theme.borderRadius.full : props.theme.borderRadius.sm};
  transition: all ${props => props.theme.transitions.fast};
  
  ${props => variantStyles[props.variant || 'primary']}
`;