import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { mergeStyles } from '@fluentui/react';

// Application Insights - https://github.com/microsoft/ApplicationInsights-JS/tree/master/extensions/applicationinsights-react-js
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

// Config
import baseConfig from './config.json';

const configData = {
  ...baseConfig
};

const appInsightsKey = import.meta.env.VITE_APPINSIGHTS_KEY;

export const appInsights = new ApplicationInsights({
  config: { instrumentationKey: appInsightsKey }
});
if (appInsightsKey) {
  appInsights.loadAppInsights();
}

export const ConfigContext = React.createContext()

// Inject some global styles
mergeStyles({
  ':global(body,html,#root)': {
    margin: 0,
    padding: 0,
    minHeight: '100vh',
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigContext.Provider value={configData}>
      <App />
    </ConfigContext.Provider>
  </React.StrictMode>
);
