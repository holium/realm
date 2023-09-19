'use client';

import { useEffect, useState } from 'react';

import { PassportProfile } from './lib/types';
import { shipUrl } from './lib/shared';

import IncognitoPage from './pages/incognito';
import ViewProfilePage from './pages/profile';

type PageMode = 'incognito' | 'view' | 'edit';

export default function Home() {
  const [pageMode, setPageMode] = useState<PageMode>('view');
  const [profile, setProfile] = useState<PassportProfile | null>(null);

  useEffect(() => {
    // get our passport from the publicly facing ship API. this is
    //   different than the %passport API which gives much more detailed information.
    //  the public version only gives the bare minimum data necessary to
    //   render the UI
    fetch(`${shipUrl}/~/scry/profile/our.json`, {
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
          setPageMode('incognito');
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
              setPageMode('edit');
              break;
            }
          }
        }
        setProfile(data);
      })
      .catch((e) => console.error(e));
  }, []);

  if (!profile) return <>Please wait. Loading...</>;

  return pageMode === 'incognito' ? (
    <IncognitoPage patp={profile.contact.ship} />
  ) : (
    <ViewProfilePage profile={profile} canEdit={pageMode === 'edit'} />
  );
}
