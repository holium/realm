import { createRoot } from 'react-dom/client';
import { Mouse } from './system/mouse/Mouse';
import { Presences } from './system/mouse/Presences';
import './mouse.css';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <>
    <Mouse />
    <Presences />
  </>
);
