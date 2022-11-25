import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import './App.css';
import {
  RemotePeer,
  RoomsManager,
  TestProtocol,
  RoomProtocol,
} from '@holium/realm-room';
import { roomsManager } from './App';
import { toJS } from 'mobx';

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
  // const [status, setStatus] = useState(PeerConnectionState.Disconnected);

  // roomsManager.presentRoom?.on('connected', () => {
  //   setStatus(PeerConnectionState.Connected);
  // });

  // if (!props.our) {
  //   peer = roomsManager.presentRoom?.getPeer(props.person);
  //   roomsManager.presentRoom?.getPeer(props.person)?.on('connected', () => {
  //     console.log(props.person, 'connected');
  //   });
  // }
  if (!our) {
    peer = roomsManager.protocol.peers.get(patp);
    if (!peer) {
      return null;
    }
    console.log(peer);
  }
  return (
    <div className="speaker-container">
      <p>{patp}</p>
      <div style={{ display: 'flex', gap: 8, flexDirection: 'row' }}>
        <button
          onClick={() => {
            if (our) {
              if (roomsManager.presentRoom?.muteStatus) {
                roomsManager.presentRoom?.unmute();
              } else {
                roomsManager.presentRoom?.mute();
              }
            }
          }}
        >
          {our
            ? roomsManager.presentRoom?.muteStatus
              ? 'Unmute'
              : 'Mute'
            : 'Mute'}
        </button>
      </div>

      {!our ? (
        <div>
          <p>Status: {peer.status}</p>
          <p>Audio streaming: {peer.isAudioAttached.toString()}</p>
        </div>
      ) : (
        <div>
          <p>Microphone: {'activated'}</p>
        </div>
      )}
    </div>
  );
});
