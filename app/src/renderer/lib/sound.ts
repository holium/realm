/*
available sound bites:
'startup'
'login'
'logout'
'system-notification'
'error'
'dm-notify'
'dm-send'
*/
import { useMemo } from 'react';

import { useShipStore } from 'renderer/stores/ship.store';

export function useSound() {
  const { settingsStore } = useShipStore();

  return useMemo(
    () => ({
      playStartup: () => {
        settingsStore.systemSoundsEnabled && SoundActions.playStartup();
      },
      playLogin: () => {
        settingsStore.systemSoundsEnabled && SoundActions.playLogin();
      },
      playLogout: () => {
        settingsStore.systemSoundsEnabled && SoundActions.playLogout();
      },
      playSystemNotification: () => {
        settingsStore.systemSoundsEnabled &&
          SoundActions.playSystemNotification();
      },
      playError: () => {
        settingsStore.systemSoundsEnabled && SoundActions.playError();
      },
      playDMNotify: () => {
        settingsStore.systemSoundsEnabled && SoundActions.playDMNotify();
      },
      playDMSend: () => {
        settingsStore.systemSoundsEnabled && SoundActions.playDMSend();
      },
      playCall: () => {
        settingsStore.systemSoundsEnabled && SoundActions.playCall();
      },
      playHangup: () => {
        settingsStore.systemSoundsEnabled && SoundActions.playHangup();
      },
      playRoomEnter: () => {
        settingsStore.systemSoundsEnabled && SoundActions.playRoomEnter();
      },
      playRoomLeave: () => {
        settingsStore.systemSoundsEnabled && SoundActions.playRoomLeave();
      },
      playRoomPeerEnter: () => {
        settingsStore.systemSoundsEnabled && SoundActions.playRoomPeerEnter();
      },
      playRoomPeerLeave: () => {
        settingsStore.systemSoundsEnabled && SoundActions.playRoomPeerLeave();
      },
    }),
    [settingsStore.systemSoundsEnabled]
  );
}

// This prevents the audio from being garbage collected
const playAudio = async (src: string) => {
  // play sound on worker thread
  if (window.audio) {
    window.audio.src = src;
  } else {
    window.audio = new window.Audio(src);
  }

  await new Promise((resolve, reject) => {
    // Wait until audio is ready to play
    window.audio.oncanplaythrough = () => {
      window.audio.play().then(resolve).catch(reject);
    };
  }).catch((err: any) => {
    console.log('audio error', err);
  });
};

export const SoundActions = {
  playStartup: () => playAudio('sounds/startup.wav'),
  playLogin: () => playAudio('sounds/login.wav'),
  playLogout: () => playAudio('sounds/logout.wav'),
  playSystemNotification: () => playAudio('sounds/system-notify.wav'),
  playError: () => playAudio('sounds/error.wav'),
  playDMNotify: () => playAudio('sounds/dm-received.wav'),
  playDMSend: () => playAudio('sounds/dm-sent.wav'),
  playCall: () => playAudio('sounds/voice-ring.wav'),
  playHangup: () => playAudio('sounds/voice-hang-up.wav'),
  playRoomEnter: () => playAudio('sounds/room-enter.wav'),
  playRoomLeave: () => playAudio('sounds/room-leave.wav'),
  playRoomPeerEnter: () => playAudio('sounds/room-peer-enter.wav'),
  playRoomPeerLeave: () => playAudio('sounds/room-peer-leave.wav'),
};
