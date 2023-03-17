import { createRoot } from 'react-dom/client';
import { Mouse } from './system/mouse/Mouse';
import { MultiplayerMice } from './system/mouse/MultiplayerMice';
import './mouse.css';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <>
    <Mouse />
    <MultiplayerMice />
  </>
);
