import { createRoot } from 'react-dom/client';
import { Mouse } from './system/mouse/Mouse';
import './mouse.css';
// import * as RealmMultiplayer from '@holium/realm-presence';
// import { Presences } from './system/desktop/components/Multiplayer/Presences';
// import { api } from './system/desktop/components/Multiplayer/multiplayer';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <>
    {/* <MultiplayerMouse /> */}
    <Mouse />
  </>
);

// function MultiplayerMouse() {
//   const { ship, spaces } = useServices();
//   if (!ship?.isLoaded) return null;

//   return (
//     <RealmMultiplayer.Provider
//       api={api}
//       ship={ship}
//       channel={spaces.selected?.path}
//     >
//       <Cursors />
//     </RealmMultiplayer.Provider>
//   );
// }

// function Cursors() {
//   const { api } = useContext(
//     RealmMultiplayer.Context as React.Context<{
//       api: RealmMultiplayer.RealmMultiplayerInterface; // idk why typescript made me manually type this, maybe yarn workspace related
//     }>
//   );
//   const { shell } = useServices();
//   useEffect(() => {
//     api?.send({
//       event: RealmMultiplayer.CursorEvent.Leave,
//     });
//   }, [shell.isMouseInWebview]);
//   return <Presences />;
// }
