import { FC, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';

import './App.css';
import { RemotePeer } from '@holium/realm-room';
import { roomsManager } from './App';
// import { toJS } from 'mobx';

type ISpeaker = {
  our: boolean;
  patp: string;
  peer?: RemotePeer;
  cursors?: boolean;
  type: 'host' | 'speaker' | 'listener';
};

export const Speaker: FC<ISpeaker> = observer((props: ISpeaker) => {
  let peer: any;
  const { our, patp } = props;

  if (!our) {
    peer = useRef(roomsManager.protocol.peers.get(patp));
    if (!peer) {
      return null;
    }
  }

  return (
    <div className="speaker-container">
      <p style={{ margin: 0 }}>{patp}</p>
      <p style={{ marginTop: 6, marginBottom: 12, opacity: 0.5, fontSize: 12 }}>
        {peer?.current.patpId}
      </p>
      <div style={{ display: 'flex', gap: 8, flexDirection: 'row' }}>
        <button
          onClick={() => {
            if (our) {
              if (roomsManager.muteStatus) {
                roomsManager.unmute();
              } else {
                roomsManager.mute();
              }
            }
          }}
        >
          {our ? (roomsManager.muteStatus ? 'Unmute' : 'Mute') : 'Mute'}
        </button>
      </div>

      {!our ? (
        <div>
          <p>Status: {peer.current.status}</p>
          <p>Audio streaming: {peer.current.isAudioAttached.toString()}</p>
        </div>
      ) : (
        <div>
          <p>Microphone: {'activated'}</p>
        </div>
      )}
    </div>
  );
});
