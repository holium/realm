import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import './App.css';
import { roomsManager } from './App';
import { toJS } from 'mobx';
type ISpeaker = {
  our: boolean;
  person: string;
  cursors?: boolean;
  type: 'host' | 'speaker' | 'listener';
};

export const Speaker: FC<ISpeaker> = observer((props: ISpeaker) => {
  let peer: any;
  // const [status, setStatus] = useState(PeerConnectionState.Disconnected);

  // roomsManager.presentRoom?.on('connected', () => {
  //   setStatus(PeerConnectionState.Connected);
  // });

  if (!props.our) {
    peer = roomsManager.presentRoom?.getPeer(props.person);
    roomsManager.presentRoom?.getPeer(props.person)?.on('connected', () => {
      console.log(props.person, 'connected');
    });
  }
  console.log(peer?.status);
  return (
    <div className="speaker-container">
      <p>{props.person}</p>
      <div style={{ display: 'flex', gap: 8, flexDirection: 'row' }}>
        <button
          onClick={() => {
            if (props.our) {
              if (roomsManager.presentRoom?.muteStatus) {
                roomsManager.presentRoom?.unmute();
              } else {
                roomsManager.presentRoom?.mute();
              }
            }
          }}
        >
          {props.our
            ? roomsManager.presentRoom?.muteStatus
              ? 'Unmute'
              : 'Mute'
            : 'Mute'}
        </button>
      </div>

      {!props.our ? (
        <div>
          <p>
            Status: {roomsManager.presentRoom?.getPeer(props.person).status}
          </p>
        </div>
      ) : (
        <div>
          <p>Microphone: {'activated'}</p>
        </div>
      )}
    </div>
  );
});
