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
const playAudio = (src) => {
  console.log(`sound.playStartup called: '${src}'`);
  if (window.audio) {
    window.audio.src = src;
  } else {
    window.audio = new window.Audio(src);
  }
  window.audio.play();
};
export const SoundActions = {
  playStartup: async () => {
    playAudio('/sounds/startup.wav');
  },
  playLogin: async () => {
    playAudio('/sounds/login.wav');
  },
  playLogout: async () => {
    playAudio('/sounds/logout.wav');
  },
  playSystemNotification: async () => {},
  playError: async () => {},
  playDMNotify: async () => {},
  playDMSend: async () => {
    playAudio('/sounds/dm_sent.wav');
  },
};
