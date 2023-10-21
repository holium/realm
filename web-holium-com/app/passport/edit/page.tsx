'use client';
import { useEffect, useRef, useState } from 'react';
import { w3mProvider } from '@web3modal/ethereum';
import { useWeb3Modal } from '@web3modal/react';
import { Wallet } from 'ethers';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  configureChains,
  createConfig,
  useAccount,
  useWalletClient,
  WagmiConfig,
} from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

import {
  PageReadyState,
  PassportConfirmAddWallet,
  RenderDeviceKeyRecovery,
  RenderGetStartedStep,
} from './workflow';

import { ErrorIcon } from '@/app/assets/icons';
import {
  DeviceAddressList,
  LinkedWalletList,
  NftList,
  NftPickerContent,
  StyledSpinner,
} from '@/app/components';
import { generateProfileSnap } from '@/app/lib/canvas';
import { saveContact } from '@/app/lib/profile';
import { savePassportOpenGraphImage, uploadDataURL } from '@/app/lib/storage';
import { ContactInfo, PassportProfile } from '@/app/lib/types';
import {
  addDevice,
  decryptWallet,
  encryptWallet,
  generateDeviceWallet,
  loadNfts,
  OwnerNft,
  recoverDeviceWallet,
} from '@/app/lib/wallet';

const chains = [mainnet];
const projectId = 'f8134a8b6ecfbef24cfd151795e94b5c';

const metadata = {
  name: 'Realm Passport',
  description: 'Realm Passport',
  url: 'https://holium.com',
  icons: [
    'https://pbs.twimg.com/profile_images/1621630320796745729/H5wKemm1_400x400.jpg',
  ],
};

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

const wagmiConfig = createConfig({
  autoConnect: true,
  // connectors: w3mConnectors({ projectId, chains })
  connectors: [
    // new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: { projectId, showQrModal: false, metadata },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
});

// const ethereumClient = new EthereumClient(wagmiConfig, chains);

interface PassportEditorProps {
  passport: PassportProfile;
  deviceWallet?: Wallet;
}

function PassportEditor({ passport, ...props }: PassportEditorProps) {
  const router = useRouter();
  const { open } = useWeb3Modal();
  const { data: walletClient /*, isError, isLoading*/ } = useWalletClient();
  const {
    /*address isConnected ,*/ connector /*, isConnected, isDisconnected*/,
  } = useAccount({
    // @ts-ignore
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected });
      if (!isReconnected) {
        setWalletAddress(address);
        setDialogContentId('confirm-add-wallet');
        passportDialog.current?.showModal();
      }
    },
    onDisconnect() {
      console.log('onDisconnect called');
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nftPicker = useRef<HTMLDialogElement>(null);
  const passportDialog = useRef<HTMLDialogElement>(null);
  const [dialogContentId, setDialogContentId] = useState<
    'none' | 'confirm-add-wallet' | 'wait-device-decrypt' | 'pick-nft'
  >('none');
  const [displayName, setDisplayName] = useState<string>(
    passport?.contact['display-name'] || passport?.contact?.ship || ''
  );
  const [bio, setBio] = useState<string>(passport?.contact?.bio || '');
  const [nftEditMode] = useState<'add-nft' | 'choose-nft'>('choose-nft');
  const [ownerNfts] = useState<OwnerNft[]>([]);
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | undefined>(
    undefined
  );
  const [deviceWallet, setDeviceWallet] = useState<Wallet | null>(
    props.deviceWallet ? props.deviceWallet : null
  );
  const [currentPassport, setCurrentPassport] =
    useState<PassportProfile>(passport);
  const [, setEditState] = useState<string>('none');

  const [readyState, setReadyState] = useState<'ready' | 'loading' | 'error'>(
    'ready'
  );

  const filesChanged = (e: any) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!(e.target && e.target.result)) {
        console.error('image upload error');
        return;
      }
      uploadDataURL(
        `${(window as any).ship}-profile-image`,
        e.target.result as string
      ).then((url) => {
        const contact: ContactInfo = {
          ...currentPassport.contact,
          'display-name': displayName,
          bio: bio,
          avatar: {
            type: 'image',
            img: url,
          },
        };
        saveContact(contact)
          .then((passport: PassportProfile) => setCurrentPassport(passport))
          .catch((e) => console.error(e));
      });
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const onSaveClick = (e: any) => {
    e.preventDefault();
    generateProfileSnap(document).then((dataurl: string) => {
      // console.log('dataUrl => %o', dataUrl);
      // passport snapshot is stored in profile agent
      uploadDataURL(
        `${(window as any).ship || 'development'}-passport`,
        dataurl
      )
        .then((url) => {
          console.log('uploaded image => %o', url);
          try {
            (async function (url) {
              await savePassportOpenGraphImage(url);
            })(url);
          } catch (e) {
            console.error(e);
          }
        })
        .catch((e) => console.error(e));
    });

    // contact info is stored with passport agent
    const contact = {
      ...currentPassport.contact,
      'display-name': displayName,
      bio: bio,
    };
    saveContact(contact)
      .then((passport: PassportProfile) => setCurrentPassport(passport))
      .catch((e) => console.error(e));
  };

  const onPhotoUpload = (e: any) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.addEventListener('change', filesChanged);
      fileInputRef.current.click();
    }
  };

  const onAddAddressClick = () => {
    open({
      view: 'Connect',
      // featuredWalletIds: [Object.keys(supportedWallets)],
      // includedWalletIds: supportedWalletIds,
    });
  };

  const onCloseNftPickerContent = (passport?: PassportProfile) => {
    if (passport) {
      setCurrentPassport(passport);
    }
  };

  useEffect(() => {
    setReadyState('loading');
    setDialogContentId('wait-device-decrypt');
    passportDialog.current?.showModal();
    (async function () {
      try {
        const encryptedDeviceData = localStorage.getItem(
          '/holium/realm/passport/device-signing-data'
        );
        // load device wallet as early as possible. decrypting is an expensive operation
        //  so we only one to do this once per app session.
        if (!deviceWallet && encryptedDeviceData) {
          const deviceWallet = await decryptWallet(encryptedDeviceData);
          setDeviceWallet(deviceWallet);
        }
        await loadNfts(passport);
        passportDialog.current?.close();
        setReadyState('ready');
      } catch (e) {
        console.error(e);
        setReadyState('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log('render => %o', readyState);

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
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'baseline',
              }}
            >
              <h1 style={{ fontWeight: '500' }}>Passport Editor</h1>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <button>
                <div
                  style={{
                    flex: 1,
                    color: '#4e9efd',
                    fontSize: '0.8em',
                  }}
                  onClick={() => {
                    router.push(
                      process.env.NEXT_PUBLIC_BUILD === 'development'
                        ? '/passport'
                        : '/profile'
                    );
                  }}
                >
                  View Profile
                </div>
              </button>
              <div
                style={{
                  fontSize: '0.7em',
                  margin: '0px 4px',
                  color: '#ababab',
                }}
              >
                |
              </div>
              <button
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
                onClick={() => {
                  setEditState('choose-nft');
                  nftPicker.current?.showModal();
                }}
              >
                <div
                  style={{
                    color: '#4e9efd',
                    fontSize: '0.8em',
                  }}
                >
                  Choose NFT
                </div>
              </button>
              <div
                style={{
                  fontSize: '0.7em',
                  margin: '0px 4px',
                  color: '#ababab',
                }}
              >
                |
              </div>
              <button
                // disabled={true}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
                onClick={onPhotoUpload}
              >
                <div
                  style={{
                    color: '#4e9efd',
                    fontSize: '0.8em',
                  }}
                >
                  Upload Photo
                </div>
              </button>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'right',
            }}
          >
            <div>
              <button onClick={onSaveClick}>
                <div
                  style={{
                    flex: 1,
                    color: '#4e9efd',
                  }}
                >
                  Save
                </div>
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '4px',
                alignItems: 'center',
              }}
            >
              {(['saving'].includes(readyState) && (
                <>
                  <StyledSpinner color="#4e9efd" size={10} width={1.5} />
                  <div style={{ color: '#4e9efd', fontSize: '0.8em' }}>
                    saving...
                  </div>
                </>
              )) || <></>}
            </div>
          </div>
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
        {currentPassport.contact.avatar ? (
          <Image
            id={'avatar-image'}
            alt={
              currentPassport.contact['display-name'] ||
              currentPassport.contact.ship
            }
            src={currentPassport.contact.avatar.img}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '10px',
              mask:
                currentPassport.contact.avatar.type === 'nft'
                  ? 'url(nft.svg)'
                  : 'none',
            }}
          ></Image>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              borderRadius: '10px',
              backgroundColor: '#F2F7FE',
            }}
          ></div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
        ></input>
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
                Display name
              </div>
              <hr
                style={{
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
                backgroundColor: '#F6F6F6',
                borderRadius: '10px',
                marginTop: '4px',
                marginBottom: '8px',
                padding: '8px 10px',
              }}
            >
              <input
                id={'display-name'}
                type="text"
                style={{
                  lineHeight: '28px',
                  backgroundColor: 'transparent',
                  width: '100%',
                }}
                maxLength={64}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              ></input>
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
                  fontWeight: '450',
                }}
              >
                Bio
              </div>
              <hr
                style={{
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
                backgroundColor: '#F6F6F6',
                borderRadius: '10px',
                marginTop: '4px',
                marginBottom: '8px',
                padding: '8px 10px',
              }}
            >
              <textarea
                style={{
                  backgroundColor: 'transparent',
                  width: '100%',
                  resize: 'none',
                  cursor: 'auto',
                }}
                rows={2}
                maxLength={128}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              ></textarea>
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
                paddingTop: '4px',
                paddingBottom: '4px',
              }}
            >
              <NftList
                passport={currentPassport}
                onAddNftClick={() => {
                  setEditState('add-nft');
                  nftPicker.current?.showModal();
                }}
              />
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
              <LinkedWalletList
                passport={currentPassport}
                onAddAddressClick={onAddAddressClick}
              />
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
              <DeviceAddressList passport={currentPassport} />
            </div>
          </div>
        </>
      </div>
      <dialog
        id="passportDialog"
        ref={passportDialog}
        style={{
          borderRadius: '8px',
          padding: '12px',
          width: '400px',
          minWidth: '400px',
          backgroundColor: '#4292F1',
          color: '#ffffff',
        }}
      >
        {dialogContentId === 'confirm-add-wallet' &&
          connector &&
          deviceWallet &&
          walletAddress && (
            <PassportConfirmAddWallet
              parentRef={passportDialog}
              connector={connector}
              walletClient={walletClient}
              passport={passport}
              deviceWallet={deviceWallet}
              walletAddress={walletAddress}
              onClose={(passport?: PassportProfile) => {
                // if the passport is available, it means the wallet has been added to the passport
                //   and this new passport will reflect the addition of the new wallet
                if (passport) {
                  setCurrentPassport(passport);
                }
              }}
            />
          )}
        {dialogContentId === 'wait-device-decrypt' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9em',
              padding: '8px 12px',
            }}
          >
            <StyledSpinner color="#FFFFFF" size={12} width={1.5} />
            Please wait while we decrypt your device wallet...
          </div>
        )}
        {dialogContentId === 'pick-nft' && (
          <NftPickerContent
            editMode={nftEditMode}
            nfts={ownerNfts}
            passport={currentPassport}
            onClose={onCloseNftPickerContent}
          />
        )}
      </dialog>
      <dialog
        id="nftPicker"
        ref={nftPicker}
        style={{
          minWidth: '400px',
          maxWidth: '600px',
          borderRadius: '10px',
          padding: '24px',
        }}
      ></dialog>
    </div>
  );
}

// @ts-ignore
export default function Home() {
  const [passport, setPassport] = useState<PassportProfile | null>(null);
  const [pageState, setPageState] = useState<
    | 'none'
    | 'get-started'
    | 'edit-passport'
    | 'device-inconsistent'
    | 'passport-inconsistent'
  >('get-started');
  const [readyState, setReadyState] = useState<PageReadyState>('ready');
  const [, setLastError] = useState<string>('');
  const [deviceWallet, setDeviceWallet] = useState<Wallet | null>(null);
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    if (words.length === 0) {
      for (let i = 0; i < 12; i++) words.push('');
      setWords(words);
    }
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
        // parse the cookie and extract the ship name. if the ship
        //  name in the cookie matches the ship name returned by the our-passport.json
        //  call, enable edit functionality
        if (document.cookie) {
          const pairs = document.cookie.split(';');
          for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            const key = pair[0].trim();
            if (key === `urbauth-${passport.contact?.ship}`) {
              break;
            }
          }
        }
        let deviceWalletAddress = null;
        const encryptedDeviceData = localStorage.getItem(
          '/holium/realm/passport/device-signing-data'
        );
        if (encryptedDeviceData) {
          try {
            deviceWalletAddress = JSON.parse(encryptedDeviceData).address;
          } catch (e) {
            console.error(e);
          }
        }
        setPassport(passport);
        if (passport.chain.length === 0 && !deviceWalletAddress) {
          const deviceWallet = generateDeviceWallet();
          setDeviceWallet(deviceWallet);
          setPageState('get-started');
        } else if (passport.addresses.length === 0 && deviceWalletAddress) {
          setPageState('device-inconsistent');
        } else if (passport.addresses.length > 0 && !deviceWalletAddress) {
          setPageState('passport-inconsistent');
        } else {
          setPageState('edit-passport');
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, [words]);

  return (
    <>
      {passport && pageState === 'edit-passport' ? (
        <>
          <WagmiConfig config={wagmiConfig}>
            <div
              style={{
                paddingTop: '48px',
                paddingBottom: '48px',
                color: '#333333',
              }}
            >
              <PassportEditor
                passport={passport}
                deviceWallet={deviceWallet || undefined}
              />
            </div>
          </WagmiConfig>
          {/* <Web3Modal projectId={projectId} ethereumClient={ethereumClient} /> */}
        </>
      ) : null}
      {deviceWallet && pageState === 'get-started' && (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100vh',
            minHeight: '600px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <dialog
            style={{
              borderRadius: '24px',
              padding: '12px',
              width: '420px',
              minWidth: '420px',
              backgroundColor: '#4292F1',
              color: '#ffffff',
            }}
            open={true}
          >
            <>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <>
                  {RenderGetStartedStep({
                    deviceWallet: deviceWallet,
                    readyState,
                    onConfirm: () => {
                      setReadyState('loading');
                      addDevice(deviceWallet.privateKey)
                        .then((passport: PassportProfile) => {
                          setPassport(passport);
                          encryptWallet(deviceWallet.privateKey)
                            .then((data: string) => {
                              console.log('encrypted wallet: %o', data);
                              localStorage.setItem(
                                '/holium/realm/passport/device-signing-data',
                                data
                              );
                            })
                            .catch((e) => console.error(e));
                          setReadyState('ready');
                          setPageState('edit-passport');
                        })
                        .catch((e) => {
                          console.error(e);
                          setLastError(
                            'An error occurred adding the device to your passport.'
                          );
                          setReadyState('error');
                        });
                    },
                  })}
                  {/* {readyState === 'error' && (
                    <div
                      style={{
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          width: '100%',
                          gap: 8,
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255,110,110, 0.25)',
                          color: '#FF6E6E',
                          padding: '8px 0',
                        }}
                      >
                        <ErrorIcon />
                        {lastError}
                      </div>
                    </div>
                  )} */}
                </>
              </div>
            </>
          </dialog>
        </div>
      )}
      {(pageState === 'device-inconsistent' ||
        pageState === 'passport-inconsistent') && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '400px',
              gap: 12,
              borderRadius: '8px',
              border: 'solid 2px rgba(255,110,110, 0.25)',
              // backgroundColor: 'rgba(255,110,110, 0.25)',
              color: '#FF6E6E',
              padding: '16px 8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                fontWeight: 450,
              }}
            >
              {readyState === 'loading' ? (
                <StyledSpinner color="#FF6E6E" size={12} width={1.5} />
              ) : (
                <ErrorIcon />
              )}
              <span style={{ marginLeft: '8px' }}>
                Unexpected Passport State
              </span>
            </div>
            {renderError(pageState, readyState, words, setWords, () => {
              if (pageState === 'device-inconsistent') {
                setReadyState('loading');
                localStorage.removeItem(
                  '/holium/realm/passport/device-signing-key'
                );
                const deviceWallet = generateDeviceWallet();
                setDeviceWallet(deviceWallet);
                setPageState('get-started');
                setReadyState('ready');
              } else if (pageState === 'passport-inconsistent') {
                try {
                  const deviceWallet = recoverDeviceWallet(words.join(' '));
                  encryptWallet(deviceWallet.privateKey).then(
                    (data: string) => {
                      console.log('encrypted wallet: %o', data);
                      localStorage.setItem(
                        '/holium/realm/passport/device-signing-data',
                        data
                      );
                    }
                  );
                  setDeviceWallet(deviceWallet);
                  setPageState('edit-passport');
                } catch (e) {
                  console.error(e);
                }
              }
            })}
          </div>
        </div>
      )}
    </>
  );
}

function renderError(
  pageState: string,
  readyState: PageReadyState,
  words: string[],
  setWords: (words: string[]) => void,
  onAction: (pageState: string) => void
) {
  switch (pageState) {
    case 'device-inconsistent':
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            width: '100%',
            height: '100%',
          }}
        >
          <p>
            We were able to find a device key associated with this browser;
            however it seems your passport does not contain any addresses. This
            inconsistent state will prevent Passport from functioning properly.
          </p>
          <p>
            We suggest{' '}
            <span
              style={{ color: '#4292F1', cursor: 'pointer' }}
              onClick={() => onAction && onAction(pageState)}
            >
              deleting your device key by clicking here
            </span>{' '}
            and restarting the passport building process.
          </p>
        </div>
      );

    case 'passport-inconsistent':
      return RenderDeviceKeyRecovery({ readyState, words, setWords, onAction });

    default:
      return <></>;
  }
}
