// client/src/components/layout/Spinner.js
import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const SpinnerElement = styled.div`
  width: ${props => 
    props.size === 'sm' ? '16px' : 
    props.size === 'lg' ? '48px' : '32px'
  };
  height: ${props => 
    props.size === 'sm' ? '16px' : 
    props.size === 'lg' ? '48px' : '32px'
  };
  border: ${props => 
    props.size === 'sm' ? '2px' : 
    props.size === 'lg' ? '4px' : '3px'
  } solid ${props => props.theme.colors.gray[300]};
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const SpinnerText = styled.span`
  margin-left: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

function Spinner({ size = 'md', text }) {
  return (
    <SpinnerWrapper>
      <SpinnerElement size={size} />
      {text && <SpinnerText>{text}</SpinnerText>}
    </SpinnerWrapper>
  );
}

export default Spinner;