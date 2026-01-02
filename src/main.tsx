import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import App from './App';

// Initialize Grafana Faro observability
initializeFaro({
  url: 'https://faro-collector-prod-eu-central-0.grafana.net/collect/ae481174b4df41a8999d83483413597f',
  app: {
    name: 'TravelAssistant',
    version: '1.0.0',
    environment: 'production'
  },
  instrumentations: [
    ...getWebInstrumentations(),
    new TracingInstrumentation(),
  ],
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
