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
      playStartup: async () => {
        settingsStore.systemSoundsEnabled && SoundActions.playStartup();
      },
      playLogin: async () => {
        settingsStore.systemSoundsEnabled && SoundActions.playLogin();
      },
      playLogout: async () => {
        settingsStore.systemSoundsEnabled && SoundActions.playLogout();
      },
      playSystemNotification: async () => {
        settingsStore.systemSoundsEnabled &&
          SoundActions.playSystemNotification();
      },
      playError: async () => {
        settingsStore.systemSoundsEnabled && SoundActions.playError();
      },
      playDMNotify: async () => {
        settingsStore.systemSoundsEnabled && SoundActions.playDMNotify();
      },
      playDMSend: async () => {
        settingsStore.systemSoundsEnabled && SoundActions.playDMSend();
      },
      playCall: async () => {
        settingsStore.systemSoundsEnabled && SoundActions.playCall();
      },
      playHangup: async () => {
        settingsStore.systemSoundsEnabled && SoundActions.playHangup();
      },
      playRoomEnter: async () => {
        settingsStore.systemSoundsEnabled && SoundActions.playRoomEnter();
      },
      playRoomLeave: async () => {
        settingsStore.systemSoundsEnabled && SoundActions.playRoomLeave();
      },
      playRoomPeerEnter: async () => {
        settingsStore.systemSoundsEnabled && SoundActions.playRoomPeerEnter();
      },
      playRoomPeerLeave: async () => {
        settingsStore.systemSoundsEnabled && SoundActions.playRoomPeerLeave();
      },
    }),
    [settingsStore.systemSoundsEnabled]
  );
}

const playAudio = (src: string) => {
  // play sound on worker thread
  if (window.audio) {
    window.audio.src = src;
  } else {
    window.audio = new window.Audio(src);
  }
  window.audio.play().catch((err: any) => {
    console.log('audio error', err);
  });
};

export const SoundActions = {
  playStartup: async () => {
    playAudio('sounds/startup.wav');
  },
  playLogin: async () => {
    playAudio('sounds/login.wav');
  },
  playLogout: async () => {
    playAudio('sounds/logout.wav');
  },
  playSystemNotification: async () => {
    playAudio('sounds/system-notify.wav');
  },
  playError: async () => {
    playAudio('sounds/error.wav');
  },
  playDMNotify: async () => {
    playAudio('sounds/dm-received.wav');
  },
  playDMSend: async () => {
    playAudio('sounds/dm-sent.wav');
  },
  playCall: async () => {
    playAudio('sounds/voice-ring.wav');
  },
  playHangup: async () => {
    playAudio('sounds/voice-hang-up.wav');
  },
  playRoomEnter: async () => {
    playAudio('sounds/room-enter.wav');
  },
  playRoomLeave: async () => {
    playAudio('sounds/room-leave.wav');
  },
  playRoomPeerEnter: async () => {
    playAudio('sounds/room-peer-enter.wav');
  },
  playRoomPeerLeave: async () => {
    playAudio('sounds/room-peer-leave.wav');
  },
};
