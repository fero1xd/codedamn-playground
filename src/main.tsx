import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import '@/styles/globals.css';
import { ReactQueryProvider } from './providers/react-query.tsx';
import { WebSocketProvider } from './providers/ws.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebSocketProvider>
      <ReactQueryProvider>
        <App />
      </ReactQueryProvider>
    </WebSocketProvider>
  </React.StrictMode>
);
