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
// import {
//   createWeb3Modal,
//   // useWeb3Modal,
//   // Web3Modal,
// } from '@web3modal/wagmi/react';
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
  ProfileViewIcon,
  SmallPlusIcon,
  WalletIcon,
} from '@/app/assets/icons';
import { SocialButton } from '@/app/assets/styled';
// import "../styles.css";
import { isProd, shipName, shipUrl } from '@/app/lib/shared';
import { LinkedNFT, PassportProfile } from '@/app/lib/types';
import {
  addDeviceSigningKey,
  addKey,
  addNFT,
  addWalletAddress,
  createEpochPassportNode,
  generateWalletAddress,
  walletFromKey,
} from '@/app/lib/wallet';
import { saveContact } from '@/app/lib/profile';
import { useRouter } from 'next/navigation';

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

type SupportedWallets = {
  [key: string]: {
    explorer_id: string;
    image_id: string;
    image_url: string;
  };
};
const supportedWallets: SupportedWallets = {
  // metamask
  metamask: {
    explorer_id:
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    image_id: '5195e9db-94d8-4579-6f11-ef553be95100',
    image_url:
      'https://explorer-api.walletconnect.com/v3/logo/lg/5195e9db-94d8-4579-6f11-ef553be95100?projectId=f8134a8b6ecfbef24cfd151795e94b5c',
  },
  // rainbow
  rainbow: {
    explorer_id:
      '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
    image_id: '7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500',
    image_url:
      'https://explorer-api.walletconnect.com/v3/logo/md/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=f8134a8b6ecfbef24cfd151795e94b5c',
  },
  // trust
  trust: {
    explorer_id:
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
    image_id: '0528ee7e-16d1-4089-21e3-bbfb41933100',
    image_url:
      'https://explorer-api.walletconnect.com/v3/logo/md/0528ee7e-16d1-4089-21e3-bbfb41933100?projectId=f8134a8b6ecfbef24cfd151795e94b5c',
  },
};

// createWeb3Modal({
//   wagmiConfig,
//   projectId,
//   chains,
//   includeWalletIds: Object.keys(supportedWallets),
// });

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
  const router = useRouter();
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
              const idx = currentPassport.addresses.findIndex(
                (item) => item.address === address
              );
              if (idx === -1) {
                setWalletAddress(address);
                setDeviceWalletAddress(address);
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
  // const editAvatarMenu = useRef<HTMLDialogElement>(null);
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
  const [editState, setEditState] = useState<string>('none');

  if (!passport) return <></>;

  const filesChanged = (e: any) => {
    console.log('files changed: %o', e.target.files);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!(e.target && e.target.result)) {
        console.error('image upload error');
        return;
      }
      currentPassport.contact.avatar = {
        type: 'image',
        img: e.target.result as string,
      };
      setAvatar(currentPassport.contact.avatar.img);
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
      ...currentPassport.contact,
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
          open({
            view: 'Connect',
            featuredWalletIds: [Object.keys(supportedWallets)],
          })
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
            console.log(
              'creating passport root for %o...',
              address,
              walletClient,
              connector
            ),
              createEpochPassportNode(
                shipName,
                shipUrl,
                connector.name.split(' ')[0].toLowerCase(),
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
          }
          break;

        case 'confirm-device-signing-key':
          if (address && deviceWalletAddress) {
            addDeviceSigningKey(
              shipName,
              shipUrl,
              walletClient as WalletClient,
              address,
              deviceWalletAddress
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
                  deviceSigningKey as `0x${string}`
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
          const devicePrivateKey = localStorage.getItem(
            '/holium/realm/passport/device-signing-key'
          );
          if (!devicePrivateKey) {
            console.error('no device private key found');
            return;
          }
          if (walletAddress) {
            console.log('account => %o', walletClient?.account);

            console.log('getting provider...');
            connector
              ?.getProvider()
              .then((provider) => {
                console.log('provider => %o', provider);
                const walletProviderName =
                  provider.signer.session.peer.metadata.name
                    .split(' ')[0]
                    .toLowerCase();
                console.log(
                  'adding new address (walletClient, walletProvider) => %o...',
                  [walletClient, provider.signer.session.peer.metadata.name]
                );
                addWalletAddress(
                  shipName,
                  shipUrl,
                  devicePrivateKey as `0x${string}`,
                  walletAddress,
                  walletProviderName
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
        const { walletAddress, privateKey } = generateWalletAddress();
        setDeviceWalletAddress(walletAddress as `0x${string}`);
        setDeviceSigningKey(privateKey);
        setWorkflowStep('confirm-device-signing-key');
        passportWorkflow.current?.showModal();
        break;

      case 'passport-ready':
        console.log('passport-ready. launching wallet picker...');
        if (isConnected) {
          console.log('disconnecting first...');
          disconnect();
        }
        open({
          view: 'Connect',
          featuredWalletIds: [Object.keys(supportedWallets)],
        });
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
    // keep an eye on this call, looks like the 3 wallets we are interested in. metamask
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
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'baseline',
              }}
            >
              <h1 style={{ fontWeight: '500' }}>Passport Editor</h1>
              {/* <div style={{ marginLeft: '4px' }}>
                <ProfileViewIcon />
              </div> */}
              <button>
                <div
                  style={{
                    flex: 1,
                    color: '#4e9efd',
                    fontSize: '0.8em',
                    marginLeft: '4px',
                  }}
                  onClick={() =>
                    router.push(`${process.env.NEXT_PUBLIC_LINK_ROOT}/`)
                  }
                >
                  View Profile
                </div>
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <button
                disabled={true}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
                onClick={onPhotoUpload}
              >
                <div
                  style={{
                    color: 'rgba(51, 51, 51, 0.4)',
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
        {currentPassport.contact.avatar ? (
          <img
            alt={
              currentPassport.contact['display-name'] ||
              currentPassport.contact.ship
            }
            src={currentPassport.contact.avatar.img}
            style={{ width: '120px', height: '120px', borderRadius: '10px' }}
          ></img>
        ) : (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              borderRadius: '10px',
              backgroundColor: '#F2F7FE',
            }}
            onClick={() => {
              setEditState('choose-nft');
              nftPicker.current?.showModal();
            }}
            // onClick={() => editAvatarMenu.current?.show()}
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
              {currentPassport.nfts.length > 0 && (
                <>
                  {currentPassport.nfts.map((nft: LinkedNFT, idx: number) => (
                    <NFT
                      key={`owned-nft-${idx}`}
                      selectable={false}
                      nft={nft}
                    />
                  ))}
                </>
              )}
              <button
                style={{
                  width: '115px',
                  height: '115px',
                  borderRadius: '8px',
                  background: 'rgba(78, 158, 253, 0.08)',
                }}
                onClick={() => {
                  setEditState('add-nft');
                  nftPicker.current?.showModal();
                }}
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
                    {currentPassport.addresses
                      ?.filter((entry, index) => {
                        console.log(entry);
                        console.log(
                          'wallet => %o',
                          supportedWallets[entry.wallet]
                        );
                        return index !== 1;
                      })
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
                          }}
                        >
                          {/* <div
                            style={{
                              borderRadius: '4px',
                              width: '20px',
                              height: '20px',
                            }}
                          > */}
                          <img
                            style={{
                              borderRadius: '4px',
                              width: '20px',
                              height: '20px',
                            }}
                            src={
                              supportedWallets[entry.wallet]?.image_url ||
                              undefined
                            }
                            alt={entry.wallet}
                          ></img>
                          {/* </div> */}
                          <div style={{ flex: 1 }}>
                            {renderAddress(entry.address as `0x${string}`)}
                          </div>
                          {currentPassport['default-address'] ===
                            entry.address && (
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
                  {/* <div style={{ fontSize: '0.8em' }}>No addresses found</div> */}
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
                    {currentPassport.addresses
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
                          }}
                        >
                          <WalletIcon />
                          <div
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              verticalAlign: 'bottom',
                              lineHeight: '24px',
                            }}
                          >
                            {renderAddress(entry.address as `0x${string}`)}
                          </div>
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
                <>No device address</>
              )}
            </div>
          </div>
        </>
      </div>
      {/* <dialog id="editAvatarMenu" ref={editAvatarMenu}>
        some content
      </dialog> */}
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
              console.log(editState);
              if (editState === 'add-nft') {
                console.log(passport);
                const devicePrivateKey = localStorage.getItem(
                  '/holium/realm/passport/device-signing-key'
                );
                if (!devicePrivateKey) {
                  console.error('no device private key found');
                  return;
                }
                addNFT(shipName, shipUrl, devicePrivateKey, [
                  ...currentPassport.nfts,
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
                    'owned-by': walletFromKey(
                      devicePrivateKey
                    ) as `0x${string}`,
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
              } else if (editState === 'choose-nft') {
                console.log(selectedMedia.thumbnail);
                if (selectedMedia.thumbnail) {
                  saveContact({
                    ...currentPassport.contact,
                    avatar: {
                      type: 'nft',
                      img: selectedMedia.thumbnail,
                    },
                  }).then((response) => {
                    if (response.term === 'poke-fail') {
                      console.error('error => %o', response.tang[0]);
                      return;
                    }
                    setCurrentPassport(response);
                    nftPicker.current?.close();
                  });
                }
              }
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
              paddingTop: '48px',
              paddingBottom: '48px',
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
