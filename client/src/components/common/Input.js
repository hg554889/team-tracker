import styled, { css } from 'styled-components';

export const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

export const Label = styled.label`
  display: inline-block;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  
  ${props => props.required && css`
    &::after {
      content: ' *';
      color: ${props.theme.colors.danger};
    }
  `}
`;

export const Input = styled.input`
  display: block;
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.base};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  color: ${props => props.theme.colors.text.primary};
  background-color: ${props => props.theme.colors.white};
  background-clip: padding-box;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.base};
  transition: border-color ${props => props.theme.transitions.fast}, 
              box-shadow ${props => props.theme.transitions.fast};
  
  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}22;
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray[100]};
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${props => props.isInvalid && css`
    border-color: ${props.theme.colors.danger};
    
    &:focus {
      border-color: ${props.theme.colors.danger};
      box-shadow: 0 0 0 3px ${props.theme.colors.danger}22;
    }
  `}
`;

export const Textarea = styled.textarea`
  display: block;
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.base};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  color: ${props => props.theme.colors.text.primary};
  background-color: ${props => props.theme.colors.white};
  background-clip: padding-box;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.base};
  resize: vertical;
  transition: border-color ${props => props.theme.transitions.fast}, 
              box-shadow ${props => props.theme.transitions.fast};
  
  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}22;
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray[100]};
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${props => props.isInvalid && css`
    border-color: ${props.theme.colors.danger};
    
    &:focus {
      border-color: ${props.theme.colors.danger};
      box-shadow: 0 0 0 3px ${props.theme.colors.danger}22;
    }
  `}
`;

export const Select = styled.select`
  display: block;
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  padding-right: ${props => props.theme.spacing.xl};
  font-size: ${props => props.theme.typography.fontSize.base};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  color: ${props => props.theme.colors.text.primary};
  background-color: ${props => props.theme.colors.white};
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right ${props => props.theme.spacing.md} center;
  background-size: 16px 12px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.base};
  appearance: none;
  transition: border-color ${props => props.theme.transitions.fast}, 
              box-shadow ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}22;
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray[100]};
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${props => props.isInvalid && css`
    border-color: ${props.theme.colors.danger};
    
    &:focus {
      border-color: ${props.theme.colors.danger};
      box-shadow: 0 0 0 3px ${props.theme.colors.danger}22;
    }
  `}
`;

export const FormText = styled.small`
  display: block;
  margin-top: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

export const FormError = styled.small`
  display: block;
  margin-top: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.danger};
`;