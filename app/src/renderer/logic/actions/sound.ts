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
const playAudio = (src: string) => {
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
};
