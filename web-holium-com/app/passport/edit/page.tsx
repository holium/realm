'use client';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { useWeb3Modal, Web3Modal } from '@web3modal/react';
import {
  Alchemy,
  Media,
  Network,
  OwnedNft,
  OwnedNftsResponse,
} from 'alchemy-sdk';
import { WalletClient } from 'wagmi';
import {
  configureChains,
  createConfig,
  useAccount,
  useConnect,
  useDisconnect,
  useWalletClient,
  WagmiConfig,
} from 'wagmi';
import { mainnet } from 'wagmi/chains';

import {
  WorkflowStep,
  PassportWorkflowState,
  RenderWorkflowInitializeStep,
  RenderWorkflowLinkAddressStep,
  RenderWorkflowLinkDeviceKeyStep,
  RenderWorkflowLinkRootStep,
} from './workflow';

import { CloseIcon, PlusIcon } from '@/app/assets/icons';
import { SocialButton } from '@/app/assets/styled';
// import "../styles.css";
import { shipName, shipUrl } from '@/app/lib/shared';
import { PassportProfile } from '@/app/lib/types';
import {
  addKey,
  createEpochPassportNode,
  generateWalletAddress,
} from '@/app/lib/wallet';

const chains = [mainnet];
const projectId = 'f8134a8b6ecfbef24cfd151795e94b5c';

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: 'YVJ7LV7w8esHG18rdnKSERfN_OcyJWY_', // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

interface NFTProps {
  nft: OwnedNft;
  media: Media;
  selectable: boolean;
  isSelected: boolean;
  onSelectionChange: (
    e: ChangeEvent<HTMLInputElement>,
    tokenId: string
  ) => void;
}

const NFT = ({
  media,
  selectable,
  isSelected,
  onSelectionChange,
}: NFTProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        // borderTopLeftRadius: '8px',
        // borderTopRightRadius: '8px',
        // backgroundColor: '#F2F7FE',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        paddingTop: '8px',
      }}
    >
      {selectable && media.thumbnail && (
        <input
          type="checkbox"
          checked={isSelected}
          // onChange={(e) => (media.selected = e.target.checked)}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onSelectionChange && onSelectionChange(e, media.thumbnail!)
          }
        ></input>
      )}
      {media.thumbnail && (
        <img
          alt={'nft'}
          src={media.thumbnail}
          style={{
            height: '115px',
            width: '115px',
            // borderBottomLeftRadius: '8px',
            // borderBottomRightRadius: '8px',
            borderRadius: '8px',
          }}
        ></img>
      )}
    </div>
  );
};

const filesChanged = (e: any) => {
  console.log('files changed: %o', e.target.files);
};

type PassportState =
  | 'initial'
  | 'passport-not-found'
  | 'device-signing-key-not-found'
  | 'passport-ready';

interface PassportEditorProps {
  passport: PassportProfile;
}

// page states:
// not public - user chose to keep passport profile hidden
// no passport - profile is not public
// no device key - chain array of profile/our.json call is empty.
//    (i.e. the user has not made it thru the passport root / device key workflow)
// all good - we have a passport, passport root, and device key

function PassportEditor({ passport }: PassportEditorProps) {
  const { open } = useWeb3Modal();
  // const { connect } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { address /*isConnected */, connector, isConnected, isDisconnected } =
    useAccount({
      // @ts-ignore
      onConnect({ address, connector, isReconnected }) {
        console.log('Connected', { address, connector, isReconnected });
        if (!isReconnected) {
          switch (passportState) {
            case 'passport-not-found':
              setWorkflowStep('welcome');
              passportWorkflow.current?.showModal();
              break;

            case 'device-signing-key-not-found':
              setWalletAddress(passport['default-address'] as `0x${string}`);
              setDeviceSigningKey(generateWalletAddress());
              setWorkflowStep('confirm-device-signing-key');
              break;

            case 'passport-ready':
              console.log(
                'wallet connected. passport-ready. adding address...'
              );
              setWalletAddress(address);
              setWorkflowStep('confirm-add-address');
              passportWorkflow.current?.showModal();
              break;
          }
        }
      },
    });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nftPicker = useRef<HTMLDialogElement>(null);
  const passportWorkflow = useRef<HTMLDialogElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const displayNameRef = useRef<HTMLInputElement>(null);
  const [nfts, setNFTs] = useState<OwnedNft[]>([]);
  const [displayName, setDisplayName] = useState<string>(
    passport?.contact['display-name'] || passport?.contact?.ship || ''
  );
  const [bio, setBio] = useState<string>(passport?.contact?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [ourNFTs, setOurNFTs] = useState<object>({});
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('none');
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | undefined>(
    undefined
  );
  const [deviceSigningKey, setDeviceSigningKey] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [passportState, setPassportState] = useState<PassportState>('initial');

  const onSaveClick = (e: any) => {
    e.preventDefault();
    // generate a new opengraph image using canvas
    const canvas: HTMLCanvasElement = document.createElement(
      'canvas'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const avatarImage: HTMLImageElement | null = document.getElementById(
      'avatar-image'
    ) as HTMLImageElement;
    ctx.drawImage(avatarImage, 20, 20);
    ctx.moveTo(40, 20);
    const displayName: HTMLInputElement | null = document.getElementById(
      'display-name'
    ) as HTMLInputElement;
    const metrics = ctx.measureText(displayName.value);
    ctx.strokeText(displayName.value, 0, 0, 300);
    const textHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    ctx.moveTo(40, 20 + textHeight + 8);
    const patp: HTMLDivElement | null = document.getElementById(
      'patp'
    ) as HTMLDivElement;
    ctx.strokeText(patp?.innerText || '', 0, 0, 300);
    const dataUrl: string = canvas.toDataURL('img/png');
    console.log('dataUrl => %o', dataUrl);
  };

  const onPhotoUpload = (e: any) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.addEventListener('change', filesChanged);
      fileInputRef.current.click();
    }
  };

  const onNextWorkflowStep = async (state: PassportWorkflowState) => {
    console.log('onNextWorkflowStep => %o', state);
    console.log(`onNextWorkflowStep (cont'd) => %o`, [
      isLoading,
      address,
      connector,
      isConnected,
      isDisconnected,
    ]);
    return new Promise<void>((resolve, reject) => {
      switch (state.currentStep) {
        case 'welcome':
          resolve();
          break;

        case 'confirm-add-address':
          if (state.walletAddress && passport.addresses[1].address) {
            console.log('adding new address...');
            addKey(
              shipName,
              shipUrl,
              walletClient as WalletClient,
              state.walletAddress,
              passport.addresses[1].address as `0x${string}`
            )
              // the wallet address of secret/hidden wallet that now lives on this device
              .then((response: any) => {
                console.log('response => %o', response);
                passportWorkflow.current?.close();
                resolve();
              })
              .catch((e) => console.error(e));
          } else {
            console.error(
              'unexpected wallet address and/or device signing key'
            );
          }
          break;
      }
    });
    // return new Promise<void>((resolve, reject) => {
    //   switch (state.currentStep) {
    //     case 0:
    //       console.log([
    //         isLoading,
    //         address,
    //         connector,
    //         isConnected,
    //         isDisconnected,
    //       ]);
    //       if (isConnected) {
    //         disconnectAsync().then(() => {
    //           open()
    //             .then(() => {
    //               console.log([
    //                 isLoading,
    //                 address,
    //                 connector,
    //                 isConnected,
    //                 isDisconnected,
    //               ]);
    //               passportWorkflow.current?.close();
    //             })
    //             .then(() => resolve());
    //         });
    //       } else {
    //         open()
    //           .then(() => {
    //             console.log([
    //               isLoading,
    //               address,
    //               connector,
    //               isConnected,
    //               isDisconnected,
    //             ]);
    //             passportWorkflow.current?.close();
    //           })
    //           .then(() => resolve());
    //       }
    //       // if (!isConnected) {

    //       // } else {
    //       //   console.log('i am here');
    //       //   setWorkflowStep(1);
    //       //   setWalletAddress(address);
    //       //   passportWorkflow.current?.showModal();
    //       //   resolve();
    //       // }
    //       break;

    //     case 1:
    //       if (isConnected && connector && address) {
    //         console.log('creating passport root for %o...', address);
    //         createEpochPassportNode(
    //           shipName,
    //           shipUrl,
    //           connector.name,
    //           walletClient,
    //           address
    //         )
    //           .then((result) => {
    //             console.log('createEpochPassportNode response => %o', result);
    //             console.log(
    //               `wallet addresses: [${address}, ${walletClient?.account.address}]`
    //             );
    //             // we already have a passport root; therefore generate a new device key
    //             //  and set the workflow step to 2
    //             setDeviceKey(generateWalletAddress());
    //             setWorkflowStep(2);
    //             resolve();
    //           })
    //           .catch((e) => console.error(e));
    //       } else {
    //         console.error('unexpected wallet state');
    //       }
    //       break;

    //     case 2:
    //       console.log('add key');
    //       if (address && deviceKey) {
    //         addKey(
    //           shipName,
    //           shipUrl,
    //           walletClient as WalletClient,
    //           address,
    //           deviceKey
    //         )
    //           // the wallet address of secret/hidden wallet that now lives on this device
    //           .then((response: any) => {
    //             console.log('addKey response => %o', response);
    //             localStorage.setItem(
    //               '/holium/realm/passport/wallet-address',
    //               response.addresses[1].address
    //             );
    //             passportWorkflow.current?.close();
    //             resolve();
    //           })
    //           .catch((e) => console.error(e));
    //       } else {
    //         console.error('unexpected address and/or device signing key state');
    //         reject('unexpected address and/or device signing key state');
    //       }
    //       break;
    //   }
    // });
  };

  const onAddAddressClick = (_e: any) => {
    console.log('onAddressClick => %o', passport.chain);
    if (!passportWorkflow.current) return;

    switch (passportState) {
      case 'passport-not-found':
        setWorkflowStep('welcome');
        passportWorkflow.current.showModal();
        break;

      case 'device-signing-key-not-found':
        setWalletAddress(passport['default-address'] as `0x${string}`);
        setDeviceSigningKey(generateWalletAddress());
        setWorkflowStep('generate-device-key-confirmation');
        break;

      case 'passport-ready':
        console.log('passport-ready. launching wallet picker...');
        disconnectAsync().finally(() => open());
        // setWalletAddress(address);
        // setDeviceSigningKey(passport.addresses[1].address as `0x${string}`);
        // setWorkflowStep('confirm-add-address');
        // passportWorkflow.current.showModal();
        break;
    }

    // rule #2 . if chain length of profile/our.json call is empty, it means
    //  we have no root. user must go thru add passport workflow.
    // if (passport.chain.length === 0) {
    // }

    // do we have the passport root? if so, sanity check it
    // if (passport.chain.length === 1) {
    //   const link = passport.chain[0];
    //   const link_data = JSON.parse(link.data);
    //   if (!(link_data.link_id === 'PASSPORT_ROOT')) {
    //     console.error('invalid passport chain root');
    //     return;
    //   }
    //   // we already have a passport root; therefore generate a new device key
    //   //  and set the workflow step to 2
    //   setWorkflowStep(2);
    //   setDeviceKey(generateWalletAddress());
    //   addKey(shipUrl, walletClient as WalletClient)
    //     // the wallet address of secret/hidden wallet that now lives on this device
    //     .then((response: any) => {
    //       console.log('addKey response => %o', response);
    //       localStorage.setItem(
    //         '/holium/realm/passport/wallet-address',
    //         response.addresses[1].address
    //       );
    //     })
    //     .catch((e) => console.error(e));
    // }

    // sanity check the existence of the device key
    if (passport.chain.length >= 2) {
      // const link = passport.chain[1];
      // // do other types of validation here?
      // const link_data = JSON.parse(link.data);
      // if (
      //   !(
      //     link.link_type === 'KEY_ADD' &&
      //     link_data.public_key_type === 'device_key'
      //   )
      // ) {
      //   console.error('invalid passport chain');
      //   return;
      // }
      console.log('disconnecting current wallet...');
      disconnectAsync().finally(() => {
        console.log('launching wallet modal...');
        open();
      });
    }
  };

  useEffect(() => {
    alchemy.nft
      // .getNftsForOwner(wallet.pubkey)
      .getNftsForOwner('0x653b9EA6AC3d6424a2eC360BA8E93FfaAfdA8CA1')
      .then((response: OwnedNftsResponse) => {
        const nfts = [];
        for (let i = 0; i < response.ownedNfts.length; i++) {
          const ownedNft = response.ownedNfts[i];
          nfts.push({ ...ownedNft });
        }
        setNFTs(nfts);
      });

    // setup the initial wallet state of the page before rendering anything
    if (passport.chain.length === 0) {
      // if we have no links in the chain, the user will have to start by connecting
      //   a wallet and creating the root/device keys

      // the only way this would exist is during testing, when you delete your entire
      //  chain for testing purposes. unless we build out a feature that allows you
      //  to restart the process from scratch
      localStorage.removeItem('/holium/realm/passport/device-signing-key');

      setPassportState('passport-not-found');
    } else if (passport.chain.length === 1) {
      localStorage.removeItem('/holium/realm/passport/device-signing-key');

      setPassportState('device-signing-key-not-found');
    } else if (passport.chain.length >= 2) {
      const deviceKey = localStorage.getItem(
        '/holium/realm/passport/device-signing-key'
      );
      if (!deviceKey) {
        console.error(
          'invalid passport state. passport chain has more than two links with no device signing key found'
        );
      }
      setPassportState('passport-ready');
    }
  }, []);

  useEffect(() => {
    if (passport.addresses) {
      passport.addresses.map((wallet, idx) => {
        alchemy.nft
          // .getNftsForOwner(wallet.pubkey)
          .getNftsForOwner('0x653b9EA6AC3d6424a2eC360BA8E93FfaAfdA8CA1')
          .then((response: OwnedNftsResponse) => {
            setNFTs([...response.ownedNfts]);
          });
      });
    } else {
      setNFTs([]);
    }
  }, [passport['default-address'], passport.addresses]);

  // useEffect(() => {
  //   if (isError) {
  //     console.error('error loading wallet client');
  //     return;
  //   }
  //   if (!isLoading && address && connector) {
  //     console.log('connector: %o', connector?.name);
  //     console.log('address loaded: %o', address);

  //     // if (startedWorkflow) {
  //     //   goToWorkflowStep(1);
  //     // }

  //     // createEpochPassportNode(shipUrl, connector.name, walletClient, address)
  //     //   .then((result) => {
  //     //     console.log('createEpochPassportNode response => %o', result);
  //     //     console.log(
  //     //       `wallet addresses: [${address}, ${walletClient?.account.address}]`
  //     //     );
  //     //     addKey(shipUrl, walletClient as WalletClient)
  //     //       // the wallet address of secret/hidden wallet that now lives on this device
  //     //       .then((response: any) => {
  //     //         console.log('addKey response => %o', result);
  //     //         localStorage.setItem(
  //     //           '/holium/realm/passport/wallet-address',
  //     //           response.addresses[1].address
  //     //         );
  //     //       })
  //     //       .catch((e) => console.error(e));
  //     //   })
  //     //   .catch((e) => console.error(e));
  //     // alchemy.nft
  //     //   .getNftsForOwner(address)
  //     //   .then((meta: OwnedNftsResponse) => console.log(meta))
  //     //   .catch((e) => console.error(e));
  //   }
  // }, [address, connector, walletClient, isError, isLoading]);
  // useEffect(() => {
  //   console.log('isConnected changed: %o', isConnected);
  // }, [isConnected]);

  console.log('rendering workflow step: %o', workflowStep);

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
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* <SocialButton onClick={open}>Connect Wallet</SocialButton>
          <div style={{ flex: 1 }}></div> */}
          <SocialButton onClick={onSaveClick}>Save</SocialButton>
        </div>
        <h1 style={{ fontWeight: '500' }}>Passport Editor</h1>
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
        {avatar ? (
          <img
            alt={avatar}
            src={avatar}
            style={{ width: '80px', height: '80px', borderRadius: '10px' }}
          ></img>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '10px',
              backgroundColor: '#F2F7FE',
            }}
          >
            <PlusIcon />
          </div>
        )}
        <SocialButton onClick={onPhotoUpload}>Upload photo</SocialButton>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
        ></input>
        <SocialButton onClick={() => nftPicker.current?.showModal()}>
          Choose NFT
        </SocialButton>
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
                backgroundColor: '#F6F6F6',
                borderRadius: '10px',
                marginTop: '4px',
                marginBottom: '8px',
                padding: '8px 10px',
              }}
            >
              <input
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
              {nfts.length === 0 ? (
                <div style={{ fontSize: '0.8em' }}>No NFTs found</div>
              ) : (
                <>
                  {nfts.map((nft: OwnedNft, _idx: number) =>
                    nft.media.map((media: Media, idx: number) => (
                      <NFT
                        key={`owned-nft-${idx}`}
                        selectable={true}
                        isSelected={
                          (media.thumbnail &&
                            // eslint-disable-next-line no-prototype-builtins
                            ourNFTs.hasOwnProperty(media.thumbnail)) ||
                          false
                        }
                        nft={nft}
                        media={media}
                        onSelectionChange={(
                          _e: ChangeEvent<HTMLInputElement>,
                          _thumbnail: string
                        ) => {}}
                      />
                    ))
                  )}
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
                  // color: '#333333',
                  marginLeft: '8px',
                  backgroundColor: '#333333',
                  width: '100%',
                  height: '1px',
                  border: 0,
                  opacity: '10%',
                  flex: 1,
                  marginRight: '8px',
                }}
              />
              <SocialButton onClick={onAddAddressClick}>
                Add Address
              </SocialButton>
            </div>
            <div
              style={{
                color: '#333333',
                paddingTop: '4px',
                paddingBottom: '4px',
              }}
            >
              {/* {props.passport?.addresses?.length > 0 ? (
                props.passport?.addresses?.map((address, idx) => (
                  <div key={`address-${idx}`}>{address}</div>
                  // <Address
                  //   key={`address-${idx}`}
                  //   image={address.image || undefined}
                  //   pubkey={address.pubkey}
                  //   selectable={true}
                  //   isSelected={true}
                  // />
                ))
              ) : (
                <div style={{ fontSize: '0.8em' }}>No addresses found</div>
              )} */}
            </div>
          </div>
        </>
      </div>
      <dialog
        id="passportWorkflowDialog"
        ref={passportWorkflow}
        style={{
          borderRadius: '24px',
          padding: '12px',
          width: '400px',
          minWidth: '400px',
          backgroundColor: '#4292F1',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            // gap: 8,
          }}
        >
          <button
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignSelf: 'flex-end',
            }}
            onClick={(e) => {
              e.preventDefault();
              console.log('click close');
              if (passportWorkflow.current) {
                console.log('closing dialog');
                passportWorkflow.current?.close();
              }
            }}
          >
            <CloseIcon />
          </button>
          {workflowStep === 'welcome' &&
            RenderWorkflowInitializeStep({
              state: {
                currentStep: workflowStep,
                passport: passport,
              },
              onNextWorkflowStep,
            })}
          {workflowStep === 'confirm-passport-root' &&
            RenderWorkflowLinkRootStep({
              state: {
                currentStep: workflowStep,
                walletAddress: walletAddress as `0x${string}`,
                passport: passport,
              },
              onNextWorkflowStep,
            })}
          {workflowStep === 'confirm-device-signing-key' &&
            RenderWorkflowLinkDeviceKeyStep({
              state: {
                currentStep: workflowStep,
                walletAddress: walletAddress as `0x${string}`,
                deviceSigningKey: deviceSigningKey as `0x${string}`,
                passport: passport,
              },
              onNextWorkflowStep,
            })}
          {workflowStep === 'confirm-add-address' &&
            RenderWorkflowLinkAddressStep({
              state: {
                currentStep: workflowStep,
                walletAddress: walletAddress as `0x${string}`,
                deviceSigningKey: deviceSigningKey as `0x${string}`,
                passport: passport,
              },
              onNextWorkflowStep,
            })}
          {/* {workflowStep === 2 && renderStep3()} */}
        </div>
      </dialog>
      <dialog
        id="nftPicker"
        ref={nftPicker}
        style={{
          minWidth: '400px',
          borderRadius: '10px',
          padding: '24px',
        }}
      >
        {/* <form> */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            gap: '8px',
          }}
        >
          {nfts.map((nft: OwnedNft, _idx: number) =>
            nft.media.map((media: Media, idx: number) => (
              <NFT
                key={`owned-nft-${idx}`}
                selectable={true}
                isSelected={selectedAvatar === media.thumbnail}
                nft={nft}
                media={media}
                onSelectionChange={(
                  e: ChangeEvent<HTMLInputElement>,
                  thumbnail: string
                ) => {
                  setSelectedAvatar(thumbnail);
                }}
              />
            ))
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '24px',
          }}
        >
          <SocialButton
            formMethod="dialog"
            value="cancel"
            onClick={(e: any) => {
              e.preventDefault();
              nftPicker.current?.close();
            }}
          >
            Cancel
          </SocialButton>
          <SocialButton
            id="confirmButton"
            value="default"
            onClick={(e: any) => {
              e.preventDefault();
              setAvatar(selectedAvatar);
              nftPicker.current?.close(selectedAvatar);
            }}
          >
            Confirm
          </SocialButton>
        </div>
        {/* </form> */}
      </dialog>
    </div>
  );
}

// @ts-ignore
export default function Home() {
  const [passport, setPassport] = useState<PassportProfile | null>(null);

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
              // setCanEdit(true);
              break;
            }
          }
        }
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
        <WagmiConfig config={wagmiConfig}>
          <div
            style={{
              paddingTop: '24px',
              paddingBottom: '24px',
            }}
          >
            <PassportEditor passport={passport} />
          </div>
        </WagmiConfig>
      ) : null}

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
