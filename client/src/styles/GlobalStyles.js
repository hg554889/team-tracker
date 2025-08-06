import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${props => props.theme.typography.fontFamily};
    font-size: ${props => props.theme.typography.fontSize.base};
    line-height: ${props => props.theme.typography.lineHeight.normal};
    color: ${props => props.theme.colors.text.primary};
    background-color: ${props => props.theme.colors.background.default};
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    line-height: ${props => props.theme.typography.lineHeight.tight};
  }

  h1 { font-size: ${props => props.theme.typography.fontSize['4xl']}; }
  h2 { font-size: ${props => props.theme.typography.fontSize['3xl']}; }
  h3 { font-size: ${props => props.theme.typography.fontSize['2xl']}; }
  h4 { font-size: ${props => props.theme.typography.fontSize.xl}; }
  h5 { font-size: ${props => props.theme.typography.fontSize.lg}; }
  h6 { font-size: ${props => props.theme.typography.fontSize.base}; }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: color ${props => props.theme.transitions.fast};

    &:hover {
      color: ${props => props.theme.colors.primaryDark};
    }
  }

  button {
    cursor: pointer;
    font-family: inherit;
    transition: all ${props => props.theme.transitions.base};
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.gray[100]};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.gray[400]};
    border-radius: ${props => props.theme.borderRadius.full};
    
    &:hover {
      background: ${props => props.theme.colors.gray[500]};
    }
  }

  /* Loading animation */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  @keyframes slideOut {
    from { transform: translateX(0); }
    to { transform: translateX(-100%); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

export default GlobalStyles;