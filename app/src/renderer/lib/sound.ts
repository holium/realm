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
  playStartup: async () => {
    await playAudio('sounds/startup.wav');
  },
  playLogin: async () => {
    await playAudio('sounds/login.wav');
  },
  playLogout: async () => {
    await playAudio('sounds/logout.wav');
  },
  playSystemNotification: async () => {
    await playAudio('sounds/system-notify.wav');
  },
  playError: async () => {
    await playAudio('sounds/error.wav');
  },
  playDMNotify: async () => {
    await playAudio('sounds/dm-received.wav');
  },
  playDMSend: async () => {
    await playAudio('sounds/dm-sent.wav');
  },
  playCall: async () => {
    await playAudio('sounds/voice-ring.wav');
  },
  playHangup: async () => {
    await playAudio('sounds/voice-hang-up.wav');
  },
  playRoomEnter: async () => {
    await playAudio('sounds/room-enter.wav');
  },
  playRoomLeave: async () => {
    await playAudio('sounds/room-leave.wav');
  },
  playRoomPeerEnter: async () => {
    await playAudio('sounds/room-peer-enter.wav');
  },
  playRoomPeerLeave: async () => {
    await playAudio('sounds/room-peer-leave.wav');
  },
};
