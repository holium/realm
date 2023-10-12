'use client';

import { CopyIcon } from '@/app/assets/icons';
// import { isProd, shipUrl } from '@/app/lib/shared';
import { LinkedNFT, PassportProfile } from '@/app/lib/types';
import { renderAddress } from './edit/workflow';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface NFTProps {
  nft: LinkedNFT;
}

const NFT = ({ nft }: NFTProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        paddingTop: '8px',
      }}
    >
      {nft['image-url'] && (
        <img
          alt={'nft'}
          src={nft['image-url']}
          style={{
            height: '115px',
            width: '115px',
            borderRadius: '8px',
          }}
        ></img>
      )}
    </div>
  );
};

interface PassportViewProps {
  canEdit?: boolean;
  passport: PassportProfile;
}

function PassportView({ canEdit, passport }: PassportViewProps) {
  const router = useRouter();
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: '490px',
          width: '490px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <h1 style={{ fontWeight: '500' }}>Passport</h1>
          </div>
          {canEdit && (
            <button>
              <div
                style={{
                  flex: 1,
                  color: '#4e9efd',
                }}
                onClick={() =>
                  router.push(`${process.env.NEXT_PUBLIC_LINK_ROOT}/edit`)
                }
              >
                Edit
              </div>
            </button>
          )}
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: 'center',
          }}
        >
          {passport.contact.avatar ? (
            <img
              alt={passport.contact['display-name'] || passport.contact.ship}
              src={passport.contact.avatar.img}
              style={{ width: '120px', height: '120px', borderRadius: '10px' }}
            ></img>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '120px',
                borderRadius: '10px',
                backgroundColor: 'rgba(78, 158, 253, 0.08)',
                fontSize: '0.8em',
              }}
            >
              No image
            </div>
          )}
          <div style={{ color: '#333333', fontWeight: 'bold' }}>
            {passport.contact['display-name']}
          </div>
          <div style={{ fontSize: '0.9em', color: 'rgba(51, 51, 51, 0.5)' }}>
            {passport.contact.ship}
          </div>
        </div>

        <>
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
                  fontWeight: '450',
                  color: '#333333',
                  opacity: '0.4',
                  whiteSpace: 'nowrap',
                }}
              >
                Bio
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
            <div style={{ paddingTop: '4px', paddingBottom: '4px' }}>
              {passport.contact.bio || 'No bio'}
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
                  fontWeight: '450',
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
                paddingTop: '4px',
                paddingBottom: '4px',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {passport.nfts.length === 0 ? (
                <>No nfts</>
              ) : (
                <>
                  {passport.nfts.map((nft: LinkedNFT, idx: number) => (
                    <NFT key={`owned-nft-${idx}`} nft={nft} />
                  ))}
                </>
              )}
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
                  fontWeight: '450',
                }}
              >
                Linked addresses
              </div>
              <hr
                style={{
                  marginLeft: '8px',
                  backgroundColor: '#333333',
                  width: '100%',
                  height: '1px',
                  border: 0,
                  opacity: '10%',
                  flex: 1,
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
              {passport.addresses?.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <>
                    {passport.addresses
                      ?.filter((value, index) => index !== 1)
                      .map((entry, idx) => (
                        <div
                          key={`address-${idx}`}
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            backgroundColor: '#F2F4F5',
                            borderRadius: '8px',
                            gap: '8px',
                            padding: '8px',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div
                            style={{
                              borderRadius: '4px',
                              width: '20px',
                              height: '20px',
                              backgroundColor: '#5482EC',
                            }}
                          ></div>
                          <div style={{ flex: 1, verticalAlign: 'middle' }}>
                            {renderAddress(entry.address as `0x${string}`)}
                          </div>
                          {passport['default-address'] === entry.address && (
                            <div style={{ color: '#878889' }}>Public</div>
                          )}
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(entry.address)
                            }
                          >
                            <CopyIcon fill={'#9FA1A1'} />
                          </button>
                        </div>
                      ))}
                  </>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.8em' }}>No addresses found</div>
                </div>
              )}
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
                  fontWeight: '450',
                }}
              >
                Device addresses
              </div>
              <hr
                style={{
                  marginLeft: '8px',
                  backgroundColor: '#333333',
                  width: '100%',
                  height: '1px',
                  border: 0,
                  opacity: '10%',
                  flex: 1,
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
              {passport.addresses?.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <>
                    {passport.addresses
                      ?.filter((entry, idx) => idx === 1)
                      .map((entry, idx) => (
                        <div
                          key={`address-${idx}`}
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            backgroundColor: '#F2F4F5',
                            borderRadius: '8px',
                            gap: '8px',
                            padding: '8px',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div
                            style={{
                              borderRadius: '4px',
                              width: '20px',
                              height: '20px',
                              backgroundColor: '#5482EC',
                            }}
                          ></div>
                          <div style={{ flex: 1, verticalAlign: 'middle' }}>
                            {renderAddress(entry.address as `0x${string}`)}
                          </div>
                          {passport['default-address'] === entry.address && (
                            <div style={{ color: '#878889' }}>Public</div>
                          )}
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(entry.address)
                            }
                          >
                            <CopyIcon fill={'#9FA1A1'} />
                          </button>
                        </div>
                      ))}
                  </>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.8em' }}>No addresses found</div>
                </div>
              )}
            </div>
          </div>
        </>
      </div>
    </div>
  );
}

// @ts-ignore
export default function Home() {
  const [passport, setPassport] = useState<PassportProfile | null>(null);
  const [canEdit, setCanEdit] = useState<boolean>(false);

  useEffect(() => {
    // get our passport from the publicly facing ship API. this is
    //   different than the %passport API which gives much more detailed information.
    //  the public version only gives the bare minimum data necessary to
    //   render the UI
    fetch(`/passport/our`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((passport: PassportProfile) => {
        console.log(passport);
        // parse the cookie and extract the ship name. if the ship
        //  name in the cookie matches the ship name returned by the our-passport.json
        //  call, enable edit functionality
        if (document.cookie) {
          const pairs = document.cookie.split(';');
          for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            const key = pair[0].trim();
            if (key === `urbauth-${passport.contact?.ship}`) {
              setCanEdit(true);
              break;
            }
          }
        }
        console.log('setting passport => %o', passport);
        setPassport(passport);
      })
      .catch((e) => {
        console.error(e);
        // setPageMode('error');
      });
  }, []);

  return (
    <>
      {passport ? (
        <div style={{ padding: '48px' }}>
          <PassportView canEdit={canEdit} passport={passport} />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            height: '100vh',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Loading. Please wait...
        </div>
      )}
    </>
  );
}
