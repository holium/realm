import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Mouse } from './components/Mouse';
import './index.css';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <Mouse />
  </StrictMode>
);
