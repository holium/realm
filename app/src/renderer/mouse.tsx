import { createRoot } from 'react-dom/client';
import { Mouse } from './system/mouse/Mouse';
import { MultiplayerMouse } from './system/mouse/Multiplayer/MultiplayerMouse';
import './mouse.css';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <>
    <Mouse />
    <MultiplayerMouse />
  </>
);
