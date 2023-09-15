import { useWeb3Modal } from '@web3modal/react';
import { useEffect, useState } from 'react';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';

import { PassportProfile } from 'lib/types';

import ViewProfilePage from './profile/view';
import IncognitoPage from './incognito';

const shipUrl = 'http://localhost';
type PageMode = 'incognito' | 'view' | 'edit';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [pageMode, setPageMode] = useState<PageMode>('view');
  const [profile, setProfile] = useState<PassportProfile | null>(null);

  useEffect(() => {
    // get our passport from the publicly facing ship API. this is
    //   different than the %passport API which gives much more detailed information.
    //  the public version only gives the bare minimum data necessary to
    //   render the UI
    fetch(`${shipUrl}/~/scry/passport/public/our-passport.json`, {
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
            if (key === `urbauth-${data.patp}`) {
              setPageMode('edit');
              break;
            }
          }
        }
        setProfile(data);
      })
      .catch((e) => console.error(e));
  }, []);

  // useEffect(() => {
  //   if (isError) {
  //     console.error('error loading wallet client');
  //     return;
  //   }
  //   if (address && !isLoading) {
  //     createEpochPassportNode(shipUrl, walletClient, address)
  //       .then((result) =>
  //         console.log('createEpochPassportNode response => %o', result)
  //       )
  //       .catch((e) => console.error(e));
  //   }
  // }, [isError, isLoading]);
  async function onOpen() {
    setLoading(true);
    await open();
    setLoading(false);
  }

  function onClick() {
    if (isConnected) {
      disconnect();
    } else {
      onOpen();
    }
  }

  if (!profile) return <>Please wait. Loading...</>;

  return pageMode === 'incognito' ? (
    <IncognitoPage patp={profile.contact.ship} />
  ) : (
    <ViewProfilePage canEdit={pageMode === 'edit'} />
  );
}
