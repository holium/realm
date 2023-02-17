import { createRoot } from 'react-dom/client';
import { MultiplayerMouse } from './system/mouse/Multiplayer/MultiplayerMouse';
import './mouse.css';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<MultiplayerMouse />);
