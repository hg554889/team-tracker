// client/src/components/layout/Spinner.js
import React from 'react';
import styled, { keyframes, css } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0,-8px,0);
  }
  70% {
    transform: translate3d(0,-4px,0);
  }
  90% {
    transform: translate3d(0,-1px,0);
  }
`;

const SpinnerWrapper = styled.div`
  display: ${props => props.inline ? 'inline-flex' : 'flex'};
  align-items: center;
  justify-content: center;
  flex-direction: ${props => props.vertical ? 'column' : 'row'};
  gap: ${props => props.theme.spacing.sm};
`;

// 기본 회전 스피너
const SpinnerElement = styled.div`
  width: ${props => {
    switch (props.size) {
      case 'xs': return '12px';
      case 'sm': return '16px';
      case 'lg': return '48px';
      case 'xl': return '64px';
      default: return '32px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'xs': return '12px';
      case 'sm': return '16px';
      case 'lg': return '48px';
      case 'xl': return '64px';
      default: return '32px';
    }
  }};
  border: ${props => {
    switch (props.size) {
      case 'xs': return '1px';
      case 'sm': return '2px';
      case 'lg': return '4px';
      case 'xl': return '5px';
      default: return '3px';
    }
  }} solid ${props => props.theme.colors.gray[300]};
  border-top-color: ${props => props.color || props.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// 점 스피너
const DotsSpinner = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const Dot = styled.div`
  width: ${props => {
    switch (props.size) {
      case 'xs': return '4px';
      case 'sm': return '6px';
      case 'lg': return '12px';
      case 'xl': return '16px';
      default: return '8px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'xs': return '4px';
      case 'sm': return '6px';
      case 'lg': return '12px';
      case 'xl': return '16px';
      default: return '8px';
    }
  }};
  background-color: ${props => props.color || props.theme.colors.primary};
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out infinite both;
  animation-delay: ${props => props.delay}s;
`;

// 바 스피너
const BarsSpinner = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Bar = styled.div`
  width: ${props => {
    switch (props.size) {
      case 'xs': return '2px';
      case 'sm': return '3px';
      case 'lg': return '6px';
      case 'xl': return '8px';
      default: return '4px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'xs': return '12px';
      case 'sm': return '16px';
      case 'lg': return '32px';
      case 'xl': return '40px';
      default: return '24px';
    }
  }};
  background-color: ${props => props.color || props.theme.colors.primary};
  animation: ${pulse} 1.2s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

// 링 스피너
const RingSpinner = styled.div`
  width: ${props => {
    switch (props.size) {
      case 'xs': return '12px';
      case 'sm': return '16px';
      case 'lg': return '48px';
      case 'xl': return '64px';
      default: return '32px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'xs': return '12px';
      case 'sm': return '16px';
      case 'lg': return '48px';
      case 'xl': return '64px';
      default: return '32px';
    }
  }};
  border: ${props => {
    switch (props.size) {
      case 'xs': return '1px';
      case 'sm': return '2px';
      case 'lg': return '4px';
      case 'xl': return '5px';
      default: return '3px';
    }
  }} solid transparent;
  border-top: ${props => {
    switch (props.size) {
      case 'xs': return '1px';
      case 'sm': return '2px';
      case 'lg': return '4px';
      case 'xl': return '5px';
      default: return '3px';
    }
  }} solid ${props => props.color || props.theme.colors.primary};
  border-right: ${props => {
    switch (props.size) {
      case 'xs': return '1px';
      case 'sm': return '2px';
      case 'lg': return '4px';
      case 'xl': return '5px';
      default: return '3px';
    }
  }} solid ${props => props.color || props.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const SpinnerText = styled.span`
  color: ${props => props.color || props.theme.colors.text.secondary};
  font-size: ${props => {
    switch (props.size) {
      case 'xs': return props.theme.typography.fontSize.xs;
      case 'sm': return props.theme.typography.fontSize.sm;
      case 'lg': return props.theme.typography.fontSize.lg;
      case 'xl': return props.theme.typography.fontSize.xl;
      default: return props.theme.typography.fontSize.base;
    }
  }};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

// 오버레이 스피너
const SpinnerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.background.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
  backdrop-filter: blur(2px);
`;

const OverlayContent = styled.div`
  background-color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  min-width: 200px;
`;

function Spinner({ 
  size = 'md', 
  text, 
  color,
  type = 'spin', // 'spin', 'dots', 'bars', 'ring'
  inline = false,
  vertical = false,
  overlay = false,
  className
}) {
  const renderSpinnerElement = () => {
    switch (type) {
      case 'dots':
        return (
          <DotsSpinner>
            <Dot size={size} color={color} delay={0} />
            <Dot size={size} color={color} delay={0.16} />
            <Dot size={size} color={color} delay={0.32} />
          </DotsSpinner>
        );
      
      case 'bars':
        return (
          <BarsSpinner>
            <Bar size={size} color={color} delay={0} />
            <Bar size={size} color={color} delay={0.1} />
            <Bar size={size} color={color} delay={0.2} />
            <Bar size={size} color={color} delay={0.3} />
            <Bar size={size} color={color} delay={0.4} />
          </BarsSpinner>
        );
      
      case 'ring':
        return <RingSpinner size={size} color={color} />;
      
      default:
        return <SpinnerElement size={size} color={color} />;
    }
  };

  const content = (
    <SpinnerWrapper inline={inline} vertical={vertical} className={className}>
      {renderSpinnerElement()}
      {text && <SpinnerText size={size} color={color}>{text}</SpinnerText>}
    </SpinnerWrapper>
  );

  if (overlay) {
    return (
      <SpinnerOverlay>
        <OverlayContent>
          {content}
        </OverlayContent>
      </SpinnerOverlay>
    );
  }

  return content;
}

// 편의 컴포넌트들
export const LoadingSpinner = ({ text = '로딩 중...', ...props }) => (
  <Spinner text={text} {...props} />
);

export const SubmitSpinner = ({ text = '처리 중...', ...props }) => (
  <Spinner text={text} size="sm" {...props} />
);

export const PageSpinner = ({ text = '페이지 로딩 중...', ...props }) => (
  <Spinner 
    text={text} 
    size="lg" 
    vertical 
    overlay 
    {...props}
  />
);

export const InlineSpinner = ({ ...props }) => (
  <Spinner size="sm" inline {...props} />
);

export default Spinner;