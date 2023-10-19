import { shipUrl } from '../lib/shared';

import { PassportProfile } from '@/app/lib/types';

// const nextId = 0;
let passport: PassportProfile | null = null;
let listeners: any[] = [];

export const passportStore = {
  async load() {
    // get our passport from the publicly facing ship API. this is
    //   different than the %passport API which gives much more detailed information.
    //  the public version only gives the bare minimum data necessary to
    //   render the UI
    fetch(`/~/scry/profile/our.json`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // if the profile is not discoverable, render some privacy page
        if (!data.discoverable) {
          return;
        }
        // parse the cookie and extract the ship name. if the ship
        //  name in the cookie matches the ship name returned by the our-passport.json
        //  call, enable edit functionality
        if (document.cookie) {
          const pairs = document.cookie.split(';');
          for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            const key = pair[0].trim();
            if (key === `urbauth-${data.contact?.ship}`) {
              break;
            }
          }
        }
        this.cache(data);
      })
      .catch((e) => {
        console.error(e);
      });
  },
  cache(passportProfile: PassportProfile) {
    passport = { ...passportProfile };
    emitChange();
  },
  async save(passportProfile: PassportProfile) {
    // push to long term storage
    this.cache(passportProfile);
    emitChange();
  },
  subscribe(listener: any) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return passport;
  },
};

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}
