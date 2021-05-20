import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ConfirmProvider } from "material-ui-confirm"
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles"
import { SystemContextProvider } from './contexts/SystemContext';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: "#061A47",
    },
    background: {
      paper: "#3D3D3D"
    }
  },
})

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <ConfirmProvider>
      <SystemContextProvider>
        <App />
      </SystemContextProvider>
    </ConfirmProvider>
  </ThemeProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
