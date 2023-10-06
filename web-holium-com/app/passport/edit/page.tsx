'use client';
import {
  ChangeEvent,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
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
  renderAddress,
  RenderWorkflowInitializeStep,
  RenderWorkflowLinkAddressStep,
  RenderWorkflowLinkDeviceKeyStep,
  RenderWorkflowLinkRootStep,
  RenderWorkflowNoneState,
} from './workflow';

import {
  CloseIcon,
  CopyIcon,
  PlusIcon,
  SmallPlusIcon,
} from '@/app/assets/icons';
import { SocialButton } from '@/app/assets/styled';
// import "../styles.css";
import { shipName, shipUrl } from '@/app/lib/shared';
import { LinkedNFT, PassportProfile } from '@/app/lib/types';
import {
  addDeviceSigningKey,
  addKey,
  addNFT,
  addWalletAddress,
  createEpochPassportNode,
  generateWalletAddress,
} from '@/app/lib/wallet';
import { saveContact } from '@/app/lib/profile';

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

interface OwnedNFTProps {
  nft: OwnedNft;
  media: Media;
  selectable: boolean;
  isSelected: boolean;
  onSelectionChange: (media: Media) => any;
}

const OwnedNFT = ({
  media,
  selectable,
  isSelected,
  onSelectionChange,
}: OwnedNFTProps) => {
  return (
    <>
      <button
        style={
          selectable && isSelected && media.thumbnail
            ? { border: 'solid 3px #5482EC', borderRadius: '8px' }
            : { border: 'solid 3px transparent' }
        }
        onClick={() => {
          onSelectionChange && onSelectionChange(media);
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {/* {selectable && media.thumbnail && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onSelectionChange && onSelectionChange(e, media.thumbnail!)
              }
            ></input>
          )} */}
          {media.thumbnail && (
            <img
              alt={'nft'}
              src={media.thumbnail}
              style={{
                height: '115px',
                width: '115px',
                borderRadius: '8px',
              }}
            ></img>
          )}
        </div>
      </button>
    </>
  );
};

interface NFTProps {
  nft: LinkedNFT;
  selectable?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (
    e: ChangeEvent<HTMLInputElement>,
    tokenId: string
  ) => void;
}

const NFT = ({ nft, selectable, isSelected, onSelectionChange }: NFTProps) => {
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
      {selectable && nft['image-url'] && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onSelectionChange && onSelectionChange(e, nft['image-url'])
          }
        ></input>
      )}
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
  const { disconnect, disconnectAsync } = useDisconnect();
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { address /*isConnected */, connector, isConnected, isDisconnected } =
    useAccount({
      // @ts-ignore
      onConnect({ address, connector, isReconnected }) {
        console.log('Connected', { address, connector, isReconnected });
        if (!isReconnected) {
          switch (passportState) {
            case 'passport-not-found':
              setWalletAddress(address);
              setWorkflowStep('confirm-passport-root');
              passportWorkflow.current?.showModal();
              break;

            case 'device-signing-key-not-found':
              setWalletAddress(
                currentPassport['default-address'] as `0x${string}`
              );
              const { walletAddress, privateKey } = generateWalletAddress();
              setDeviceWalletAddress(walletAddress as `0x${string}`);
              setDeviceSigningKey(privateKey);
              setWorkflowStep('confirm-device-signing-key');
              break;

            case 'passport-ready':
              console.log(
                'wallet connected. passport-ready. adding address...'
              );
              // is this a new wallet being added?
              const idx = passport.addresses.findIndex(
                (item) => item.address === address
              );
              if (idx === -1) {
                setWalletAddress(address);
                setWorkflowStep('confirm-add-address');
                passportWorkflow.current?.showModal();
              } else {
                console.warn('%o found in passport. skipping...');
              }
              break;
          }
        }
      },
      onDisconnect() {
        console.log('onDisconnect called');
        // switch (passportState) {
        //   case 'passport-not-found':
        //     passportWorkflow.current?.showModal();
        //     break;
        // }
        switch (workflowStep) {
          case 'confirm-device-signing-key':
            passportWorkflow.current?.showModal();
            break;
        }
      },
    });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nftPicker = useRef<HTMLDialogElement>(null);
  const editAvatarMenu = useRef<HTMLDialogElement>(null);
  const passportWorkflow = useRef<HTMLDialogElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const displayNameRef = useRef<HTMLInputElement>(null);
  const [nfts, setNFTs] = useState<OwnedNft[]>([]);
  const [displayName, setDisplayName] = useState<string>(
    passport?.contact['display-name'] || passport?.contact?.ship || ''
  );
  const [bio, setBio] = useState<string>(passport?.contact?.bio || '');
  const [selectedNft, setSelectedNft] = useState<OwnedNft | undefined>(
    undefined
  );
  const [selectedMedia, setSelectedMedia] = useState<Media | undefined>(
    undefined
  );
  const [avatar, setAvatar] = useState<string>('');
  const [ourNFTs, setOurNFTs] = useState<object>({});
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('none');
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | undefined>(
    undefined
  );
  const [deviceSigningKey, setDeviceSigningKey] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [deviceWalletAddress, setDeviceWalletAddress] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [currentPassport, setCurrentPassport] = useState<PassportProfile>(
    () => passport
  );
  const [passportState, setPassportState] = useState<PassportState>('initial');

  if (!passport) return <></>;

  const filesChanged = (e: any) => {
    console.log('files changed: %o', e.target.files);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!(e.target && e.target.result)) {
        console.error('image upload error');
        return;
      }
      passport.contact.avatar = {
        type: 'image',
        img: e.target.result as string,
      };
      setAvatar(passport.contact.avatar.img);
      console.log('passport => %o', passport);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const onSaveClick = (e: any) => {
    e.preventDefault();
    // generate a new opengraph image using canvas
    // const canvas: HTMLCanvasElement = document.createElement(
    //   'canvas'
    // ) as HTMLCanvasElement;
    // const ctx = canvas.getContext('2d');
    // if (!ctx) return;
    // const avatarImage: HTMLImageElement | null = document.getElementById(
    //   'avatar-image'
    // ) as HTMLImageElement;
    // ctx.drawImage(avatarImage, 20, 20);
    // ctx.moveTo(40, 20);
    // const displayNameElem: HTMLInputElement | null = document.getElementById(
    //   'display-name'
    // ) as HTMLInputElement;
    // const metrics = ctx.measureText(displayNameElem.value);
    // ctx.strokeText(displayNameElem.value, 0, 0, 300);
    // const textHeight =
    //   metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    // ctx.moveTo(40, 20 + textHeight + 8);
    // const patp: HTMLDivElement | null = document.getElementById(
    //   'patp'
    // ) as HTMLDivElement;
    // ctx.strokeText(patp?.innerText || '', 0, 0, 300);
    // const dataUrl: string = canvas.toDataURL('img/png');
    // console.log('dataUrl => %o', dataUrl);

    const contact = {
      ...passport.contact,
      'display-name': displayName,
      bio: bio,
    };
    console.log('saving => %o', contact);
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

  const onCloseWorkflow = () => {
    passportWorkflow.current?.close();
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
          console.log('open connect');
          if (isConnected) {
            disconnect();
          }
          open({ view: 'Connect' })
            .then(() => {
              console.log([
                isLoading,
                address,
                connector,
                isConnected,
                isDisconnected,
              ]);
              passportWorkflow.current?.close();
            })
            .then(() => resolve())
            .catch((err) => {
              console.log('caught error. rejecting... %o', err);
              reject(err);
            });
          break;

        case 'confirm-passport-root':
          if (isConnected && connector && address) {
            console.log('creating passport root for %o...', address);
            createEpochPassportNode(
              shipName,
              shipUrl,
              connector.name,
              walletClient,
              address
            )
              .then((result) => {
                console.log('createEpochPassportNode response => %o', result);
                if (result.term === 'poke-fail') {
                  reject('error creating passport root');
                  return;
                }
                console.log(
                  `wallet addresses: [${address}, ${walletClient?.account.address}]`
                );
                setCurrentPassport(result);
                // we already have a passport root; therefore generate a new device key
                //  and set the workflow step to 2
                const { walletAddress, privateKey } = generateWalletAddress();
                setDeviceWalletAddress(walletAddress as `0x${string}`);
                setDeviceSigningKey(privateKey);
                setWorkflowStep('confirm-device-signing-key');
                resolve();
              })
              .catch((e) => {
                console.error(e);
                reject(e);
              });
          } else {
            console.error('unexpected wallet state');
          }
          break;

        case 'confirm-device-signing-key':
          if (address && deviceSigningKey) {
            addDeviceSigningKey(
              shipName,
              shipUrl,
              walletClient as WalletClient,
              address,
              deviceSigningKey
            )
              // the wallet address of secret/hidden wallet that now lives on this device
              .then((response: any) => {
                console.log('addDeviceSigningKey response => %o', response);
                if (response.term === 'poke-fail') {
                  reject('error adding device key');
                  return;
                }
                setCurrentPassport(response);
                localStorage.setItem(
                  '/holium/realm/passport/device-signing-key',
                  deviceSigningKey
                );
                setPassportState('passport-ready');
                passportWorkflow.current?.close();
                resolve();
              })
              .catch((e) => {
                console.error(e);
                reject(e);
              });
          } else {
            console.error('unexpected address and/or device signing key state');
            reject('unexpected address and/or device signing key state');
          }
          break;

        case 'confirm-add-address':
          if (walletAddress && currentPassport.addresses[1].address) {
            console.log('adding new address...');
            addWalletAddress(
              shipName,
              shipUrl,
              walletClient as WalletClient,
              walletAddress,
              currentPassport.addresses[1].address as `0x${string}`
            )
              // the wallet address of secret/hidden wallet that now lives on this device
              .then((response: any) => {
                console.log('response => %o', response);
                if (response.term === 'poke-fail') {
                  reject('error adding device key');
                  return;
                }
                setCurrentPassport(response);
                passportWorkflow.current?.close();
                resolve();
              })
              .catch((e) => {
                console.error(e);
                reject(e);
              });
          } else {
            console.error(
              'unexpected wallet address and/or device signing key'
            );
          }
          break;
      }
    });
  };

  const onAddAddressClick = (_e: any) => {
    console.log('onAddressClick => %o', currentPassport.chain);

    switch (passportState) {
      case 'passport-not-found':
        setWorkflowStep('welcome');
        passportWorkflow.current?.showModal();
        break;

      case 'device-signing-key-not-found':
        setWalletAddress(currentPassport['default-address'] as `0x${string}`);
        setDeviceSigningKey(generateWalletAddress());
        setWorkflowStep('confirm-device-signing-key');
        passportWorkflow.current?.showModal();
        break;

      case 'passport-ready':
        console.log('passport-ready. launching wallet picker...');
        if (isConnected) {
          console.log('disconnecting first...');
          disconnect();
        }
        open({ view: 'Connect' });
        break;
    }
  };

  useEffect(() => {
    if (currentPassport['default-address']) {
      console.log('loading nfts for %o...', currentPassport['default-address']);
      alchemy.nft
        .getNftsForOwner(currentPassport['default-address'])
        .then((response: OwnedNftsResponse) => {
          const nfts = [];
          for (let i = 0; i < response.ownedNfts.length; i++) {
            const ownedNft = response.ownedNfts[i];
            nfts.push({ ...ownedNft });
          }
          setNFTs(nfts);
        });
    }
  }, [currentPassport['default-address']]);

  useEffect(() => {
    // setup the initial wallet state of the page before rendering anything
    if (currentPassport.chain.length === 0) {
      // if we have no links in the chain, the user will have to start by connecting
      //   a wallet and creating the root/device keys

      // the only way this would exist is during testing, when you delete your entire
      //  chain for testing purposes. unless we build out a feature that allows you
      //  to restart the process from scratch
      localStorage.removeItem('/holium/realm/passport/device-signing-key');

      setPassportState('passport-not-found');
    } else if (currentPassport.chain.length === 1) {
      localStorage.removeItem('/holium/realm/passport/device-signing-key');

      setPassportState('device-signing-key-not-found');
    } else if (currentPassport.chain.length >= 2) {
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

  // useEffect(() => {
  //   if (currentPassport.addresses) {
  //     currentPassport.addresses.map((wallet, idx) => {
  //       alchemy.nft
  //         .getNftsForOwner(wallet.address)
  //         .then((response: OwnedNftsResponse) => {
  //           setNFTs([...response.ownedNfts]);
  //         });
  //     });
  //   } else {
  //     setNFTs([]);
  //   }
  // }, [passport['default-address'], currentPassport.addresses]);

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
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <h1 style={{ fontWeight: '500' }}>Passport Editor</h1>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <button
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
              <div style={{ fontSize: '0.7em', margin: '0px 4px' }}>|</div>
              <button
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
                onClick={() => nftPicker.current?.showModal()}
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
            </div>
          </div>
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
        {passport.contact.avatar ? (
          <img
            alt={passport.contact['display-name'] || passport.contact.ship}
            src={passport.contact.avatar.img}
            style={{ width: '120px', height: '120px', borderRadius: '10px' }}
          ></img>
        ) : (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '10px',
              backgroundColor: '#F2F7FE',
            }}
            onClick={() => editAvatarMenu.current?.show()}
          >
            <PlusIcon />
          </button>
        )}
        {/* <SocialButton onClick={onPhotoUpload}>Upload photo</SocialButton> */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
        ></input>
        {/* <SocialButton onClick={() => nftPicker.current?.showModal()}>
          Choose NFT
        </SocialButton> */}
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
              {passport.nfts.length === 0 ? (
                <button
                  style={{
                    width: '115px',
                    height: '115px',
                    borderRadius: '8px',
                    background: 'rgba(78, 158, 253, 0.08)',
                  }}
                  onClick={() => nftPicker.current?.showModal()}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlusIcon />
                  </div>
                </button>
              ) : (
                // <div style={{ fontSize: '0.8em' }}>No NFTs found</div>
                <>
                  {passport.nfts.map((nft: LinkedNFT, idx: number) => (
                    <NFT
                      key={`owned-nft-${idx}`}
                      selectable={false}
                      nft={nft}
                    />
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
                  // color: '#333333',
                  marginLeft: '8px',
                  backgroundColor: '#333333',
                  width: '100%',
                  height: '1px',
                  border: 0,
                  opacity: '10%',
                  flex: 1,
                  // marginRight: '8px',
                }}
              />
              {/* <SocialButton onClick={onAddAddressClick}>
                Add Address
              </SocialButton> */}
            </div>
            <div
              style={{
                color: '#333333',
                paddingTop: '4px',
                paddingBottom: '4px',
              }}
            >
              {currentPassport.addresses?.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <>
                    {currentPassport.addresses?.map((entry, idx) => (
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
                        <div style={{ flex: 1 }}>
                          {renderAddress(entry.address as `0x${string}`)}
                        </div>
                        {currentPassport['default-address'] ===
                          entry.address && (
                          <div style={{ color: '#878889' }}>Public</div>
                        )}
                        <CopyIcon fill={'#9FA1A1'} />
                      </div>
                    ))}
                    <button
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '8px',
                        padding: '8px',
                        // alignItems: 'center',
                        // just: 'flex-start',
                      }}
                      onClick={onAddAddressClick}
                    >
                      <SmallPlusIcon />
                      <div
                        style={{
                          flex: 1,
                          color: '#4e9efd',
                          textAlign: 'left',
                        }}
                      >
                        Add another address
                      </div>
                    </button>
                  </>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.8em' }}>No addresses found</div>
                  <button
                    style={{
                      borderRadius: '10px',
                      backgroundColor: '#FFFFFF',
                      color: '#4292F1',
                      lineHeight: '22px',
                      padding: '13px 0',
                    }}
                    onClick={onAddAddressClick}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      <div>Connect your wallet</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      </div>
      <dialog id="editAvatarMenu" ref={editAvatarMenu}>
        some content
      </dialog>
      {workflowStep === 'none' ? (
        RenderWorkflowNoneState()
      ) : (
        <dialog
          id="passportWorkflowDialog"
          ref={passportWorkflow}
          style={{
            borderRadius: '24px',
            padding: '12px',
            width: '400px',
            minWidth: '400px',
            backgroundColor: '#4292F1',
            color: '#ffffff',
          }}
          open={workflowStep !== 'none'}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              // gap: 8,
            }}
          >
            {workflowStep === 'welcome' &&
              RenderWorkflowInitializeStep({
                state: {
                  currentStep: workflowStep,
                  passport: passport,
                },
                onNextWorkflowStep,
                onCloseWorkflow,
              })}
            {workflowStep === 'confirm-passport-root' &&
              RenderWorkflowLinkRootStep({
                state: {
                  currentStep: workflowStep,
                  walletAddress: walletAddress as `0x${string}`,
                  passport: passport,
                },
                onNextWorkflowStep,
                onCloseWorkflow,
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
                onCloseWorkflow,
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
                onCloseWorkflow,
              })}
            {/* {workflowStep === 2 && renderStep3()} */}
          </div>
        </dialog>
      )}
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
              <OwnedNFT
                key={`owned-nft-${idx}`}
                selectable={true}
                isSelected={selectedMedia === media}
                nft={nft}
                media={media}
                onSelectionChange={(media: Media) => {
                  // setSelectedAvatar(thumbnail);
                  setSelectedNft(nft);
                  setSelectedMedia(media);
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
              setSelectedNft(undefined);
              setSelectedMedia(undefined);
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
              if (!(selectedNft && selectedMedia)) return;
              console.log(passport);
              const devicePrivateKey = localStorage.getItem(
                '/holium/realm/passport/device-signing-key'
              );
              if (!(devicePrivateKey && deviceWalletAddress)) {
                console.error('no device private key found');
                return;
              }
              addNFT(shipName, shipUrl, devicePrivateKey, [
                ...passport.nfts,
                {
                  'token-standard': selectedNft.tokenType,
                  name:
                    selectedNft.title ||
                    selectedNft?.rawMetadata?.name ||
                    'error',
                  'contract-address': selectedNft.contract.address,
                  'token-id': selectedNft.tokenId,
                  'image-url': selectedMedia.thumbnail || '?',
                  'chain-id': 'eth-mainnet',
                  'owned-by': deviceWalletAddress,
                },
              ])
                .then((result: any) => {
                  console.log('addNFT response => %o', result);
                  if (result.term === 'poke-fail') {
                    console.error('error => %o', result.tang[0]);
                    return;
                  }
                  setCurrentPassport(result);
                  nftPicker.current?.close();
                })
                .catch((e) => {
                  console.error(e);
                });
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

  console.log('rendering passport => %o', passport);
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
