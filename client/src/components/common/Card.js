import styled from 'styled-components';

export const Card = styled.div`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.base};
  overflow: hidden;
  transition: all ${props => props.theme.transitions.base};
  
  ${props => props.hoverable && `
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
    }
  `}
`;

export const CardHeader = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  background-color: ${props => props.theme.colors.gray[50]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
  }
`;

export const CardBody = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

export const CardFooter = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.default};
  background-color: ${props => props.theme.colors.gray[50]};
`;

export const CardTitle = styled.h5`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

export const CardSubtitle = styled.h6`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

export const CardText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.primary};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  margin-bottom: ${props => props.theme.spacing.md};
`;