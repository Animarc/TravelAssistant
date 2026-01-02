import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import App from './App';

const FARO_URL = 'https://faro-collector-prod-eu-central-0.grafana.net/collect/ae481174b4df41a8999d83483413597f';

// Initialize Grafana Faro observability
try {
  initializeFaro({
    url: FARO_URL,
    app: {
      name: 'TravelAssistant',
      version: '1.0.0',
      environment: 'production'
    },
    batching: {
      enabled: true,
      itemLimit: 150,
      sendTimeout: 1000,
    },
    ignoreErrors: [
      'NS_ERROR_CORRUPTED_CONTENT',
      'NetworkError',
      'Failed to fetch',
    ],
    instrumentations: [
      ...getWebInstrumentations(),
      new TracingInstrumentation(),
    ],
  });
} catch (e) {
  console.warn('Faro initialization failed:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
