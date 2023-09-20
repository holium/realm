'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AddressIcon, RightArrowIcon } from '@/app/assets/icons';
import { SocialButton } from '@/app/assets/styled';
import ContactCard from '@/app/components/ContactCard';
import { PassportProfile } from '@/app/lib/types';

const ChatRow = (data: any) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '4px 8px',
      }}
    >
      <img
        src={data.image}
        alt={data.name}
        style={{ width: '36px', height: '36px', marginRight: '14px' }}
      />
      <div
        style={{
          flex: 1,
          fontSize: '16px',
          lineHeight: '20px',
          fontWeight: '450',
        }}
      ></div>
      <SocialButton>Join</SocialButton>
    </div>
  );
};

type PageMode = 'incognito' | 'view' | 'edit' | 'error';

export default function Home() {
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [pageMode, setPageMode] = useState<PageMode>('view');
  const [passport, setPassport] = useState<PassportProfile | null>(null);
  const router = useRouter();

  const onEditClick = (e) => {
    e.preventDefault();
    router.push(`passport/edit`);
  };
  useEffect(() => {
    setPassport({
      nfts: [],
      cover: null,
      discoverable: false,
      'user-status': 'online',
      recommendations: [],
      crypto: null,
      addresses: [],
      'default-address': '0xf36f...34a6',
      chain: [],
      contact: {
        avatar: undefined,
        bio: null,
        ship: '~lomder-librun',
        'display-name': null,
        color: '',
      },
    });
    // if (
    //   window.__INITIAL_STATE__.discoverable &&
    //   window.__INITIAL_STATE__.passport_api_key
    // ) {
    //   // get our passport from the publicly facing ship API. this is
    //   //   different than the %passport API which gives much more detailed information.
    //   //  the public version only gives the bare minimum data necessary to
    //   //   render the UI
    //   fetch(
    //     `${shipUrl}/~/scry/profile/${window.__INITIAL_STATE__.passport_api_key}.json`,
    //     {
    //       method: 'GET',
    //       credentials: 'include',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     }
    //   )
    //     .then((response) => response.json())
    //     .then((data: PassportProfile) => {
    //       console.log(data);
    //       // parse the cookie and extract the ship name. if the ship
    //       //  name in the cookie matches the ship name returned by the our-passport.json
    //       //  call, enable edit functionality
    //       if (document.cookie) {
    //         const pairs = document.cookie.split(';');
    //         for (let i = 0; i < pairs.length; i++) {
    //           const pair = pairs[i].split('=');
    //           const key = pair[0].trim();
    //           if (key === `urbauth-${data.contact?.ship}`) {
    //             setCanEdit(true);
    //             break;
    //           }
    //         }
    //       }
    //       setPassport(data);
    //     })
    //     .catch((e) => {
    //       console.error(e);
    //       setPageMode('error');
    //     });
    // } else {
    //   setPageMode('incognito');
    // }
  }, []);

  if (!passport) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {pageMode === 'error'
          ? 'Error loading page'
          : 'Please wait. Loading...'}
      </div>
    );
  }

  return pageMode === 'incognito' ? (
    <div style={{ display: 'flex', height: '100vh', width: '800px' }}>
      {passport.contact.ship} does not want to be found
    </div>
  ) : (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '400px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {canEdit && <SocialButton onClick={onEditClick}>Edit</SocialButton>}
        <>
          <ContactCard contact={passport.contact} />
          {/* <Section /> */}
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                marginTop: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#333333',
                  opacity: '0.4',
                }}
              >
                NFTs
              </div>
              <hr
                style={{
                  // color: '#333333',
                  marginLeft: '8px',
                  backgroundColor: '#333333',
                  width: '100%',
                  height: '1px',
                  border: 0,
                  opacity: '10%',
                }}
              />
            </div>
            <div
              style={{
                color: '#333333',
                marginTop: '4px',
                marginBottom: '8px',
              }}
            ></div>
          </div>
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                marginTop: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#333333',
                  opacity: '0.4',
                  whiteSpace: 'nowrap',
                  lineHeight: '22px',
                }}
              >
                Public address
              </div>
              <hr
                style={{
                  // color: '#333333',
                  marginLeft: '8px',
                  backgroundColor: '#333333',
                  width: '100%',
                  height: '1px',
                  border: 0,
                  opacity: '10%',
                }}
              />
            </div>
            <div
              style={{
                color: '#333333',
                paddingTop: '4px',
                paddingBottom: '4px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: '8px',
                  backgroundColor: '#EFF2F4',
                  padding: '8px',
                  gap: '8px',
                  lineHeight: '20px',
                }}
              >
                <AddressIcon />
                <div style={{ flex: 1 }}>{passport['default-address']}</div>
                <RightArrowIcon />
              </div>
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                paddingTop: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#333333',
                  opacity: '0.4',
                  whiteSpace: 'nowrap',
                  lineHeight: '22px',
                }}
              >
                Chats
              </div>
              <hr
                style={{
                  // color: '#333333',
                  marginLeft: '8px',
                  backgroundColor: '#333333',
                  width: '100%',
                  height: '1px',
                  border: 0,
                  opacity: '10%',
                }}
              />
            </div>
            <div
              style={{
                color: '#333333',
                paddingTop: '4px',
                paddingBottom: '4px',
              }}
            >
              {passport.chats?.map((item, idx) => (
                <ChatRow key={`chat-row-${idx}`} data={item} />
              ))}
            </div>
          </div>
        </>
      </div>
    </div>
  );
}
