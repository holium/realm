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
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
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
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
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
  RenderGetStartedStep,
  PageReadyState,
  PageRenderState,
  RenderDeviceKeyRecovery,
} from './workflow';

import {
  CloseIcon,
  CopyIcon,
  ErrorIcon,
  PlusIcon,
  ProfileViewIcon,
  SmallPlusIcon,
  WalletIcon,
} from '@/app/assets/icons';
import { SocialButton } from '@/app/assets/styled';
// import "../styles.css";
import {
  isProd,
  shipName,
  shipUrl,
  supportedWalletIds,
  supportedWallets,
} from '@/app/lib/shared';
import { LinkedNFT, PassportProfile } from '@/app/lib/types';
import {
  addDevice,
  addDeviceSigningKey,
  addNFT,
  addWallet,
  addWalletAddress,
  createEpochPassportNode,
  generateDeviceWallet,
  generateWalletAddress,
  walletFromKey,
} from '@/app/lib/wallet';
import { saveContact } from '@/app/lib/profile';
import { useRouter } from 'next/navigation';
import { StyledSpinner } from '@/app/components';
const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants');

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

// const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });
// createWeb3Modal({ wagmiConfig, projectId, chains });
// const wagmiConfig = createConfig({
//   autoConnect: true,
//   connectors: w3mConnectors({ projectId, chains }),
//   publicClient,
// });
const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: 'YVJ7LV7w8esHG18rdnKSERfN_OcyJWY_', // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
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
          selectable && isSelected && (media.gateway || media.thumbnail)
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
          {(media.gateway || media.thumbnail) && (
            <img
              alt={'nft'}
              src={media.gateway || media.thumbnail}
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
          setWalletAddress(address);
          setWorkflowStep('confirm-add-address');
        }
      },
      onDisconnect() {
        console.log('onDisconnect called');
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
    setWorkflowStep('none');
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
      const deviceSigningKey = localStorage.getItem(
        '/holium/realm/passport/device-signing-key'
      );
      if (!deviceSigningKey) {
        console.error('no device private key found');
        return;
      }
      if (walletAddress && walletClient) {
        console.log('account => %o', walletClient.account);
        console.log('getting provider...');
        connector
          ?.getProvider()
          .then((provider) => {
            console.log('provider => %o', provider);
            let walletProviderName: string = '';
            // if signer information available, use this to get wallet name
            if (provider.isMetaMask) {
              walletProviderName = 'metamask';
            } else if (
              provider.signer.session.peer.metadata.name.indexOf('Rainbow') !==
              -1
            ) {
              walletProviderName = 'rainbow';
            } else {
              walletProviderName = provider.signer.session.peer.metadata.name
                .split(' ')[0]
                .toLowerCase();
            }
            // if (!supportedWalletIds.includes(walletProviderName)) {
            //   console.error('%o wallet not supported', walletProviderName);
            //   return;
            // }
            console.log(
              'adding new address (walletClient, walletProvider) => %o...',
              [walletClient, walletProviderName]
            );
            addWallet(
              shipUrl,
              shipName,
              deviceSigningKey,
              walletClient,
              walletProviderName,
              walletAddress
            )
              // the wallet address of secret/hidden wallet that now lives on this device
              .then((response: any) => {
                console.log('response => %o', response);
                if (response.term === 'poke-fail') {
                  reject('error adding device key');
                  return;
                }
                setWorkflowStep('none');
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
        console.error('unexpected wallet address and/or device signing key');
      }
    });
  };

  const onAddAddressClick = (_e: any) => {
    console.log('onAddressClick => %o', currentPassport.chain);

    open({
      view: 'Connect',
      // featuredWalletIds: [Object.keys(supportedWallets)],
      // includedWalletIds: supportedWalletIds,
    });
  };

  useEffect(() => {
    currentPassport.addresses
      ?.filter((entry) => !(entry.wallet === 'account'))
      .forEach((entry) => {
        console.log('loading nfts for %o...', entry.address);
        alchemy.nft
          .getNftsForOwner(entry.address)
          .then((response: OwnedNftsResponse) => {
            const nfts = [];
            console.log('loading nfts => %o', response.ownedNfts);
            for (let i = 0; i < response.ownedNfts.length; i++) {
              const ownedNft = response.ownedNfts[i];
              nfts.push({ ...ownedNft });
            }
            console.log('setting nfts => %o', nfts);
            setNFTs(nfts);
          });
      });
  }, [currentPassport.addresses.length]);

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
                    console.log(process.env.NEXT_PUBLIC_BUILD);
                    router.push(
                      process.env.NEXT_PUBLIC_BUILD === 'development'
                        ? '/passport'
                        : '/'
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
              {currentPassport.addresses.length > 1 && nfts.length > 0 ? (
                <>
                  <>
                    {currentPassport.nfts.map((nft: LinkedNFT, idx: number) => (
                      <NFT
                        key={`owned-nft-${idx}`}
                        selectable={false}
                        nft={nft}
                      />
                    ))}
                  </>
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
                </>
              ) : currentPassport.addresses.length > 1 && nfts.length === 0 ? (
                <>There are no NFTs owned by any of your linked wallets.</>
              ) : (
                <>To add NFTs, please link at least one wallet.</>
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
              {currentPassport.addresses?.filter(
                (entry) => !(entry.wallet === 'account')
              ).length > 0 ? (
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
                        console.log('address => %o', entry);
                        console.log(
                          'wallet => %o',
                          supportedWallets[entry.wallet]
                        );
                        return !(entry.wallet === 'account');
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
              {currentPassport.addresses?.filter(
                (entry, idx) => entry.wallet === 'account'
              ).length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <>
                    {currentPassport.addresses
                      ?.filter((entry, idx) => entry.wallet === 'account')
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
      {!(workflowStep === 'confirm-add-address') && RenderWorkflowNoneState()}
      {workflowStep === 'confirm-add-address' &&
        RenderWorkflowLinkAddressStep({
          state: {
            currentStep: 'confirm-add-address',
            walletAddress: walletAddress as `0x${string}`,
            deviceSigningKey:
              localStorage.getItem(
                '/holium/realm/passport/device-signing-key'
              ) || '',
            passport: passport,
          },
          onNextWorkflowStep,
          onCloseWorkflow,
        })}
      <dialog
        id="nftPicker"
        ref={nftPicker}
        style={{
          minWidth: '400px',
          maxWidth: '600px',
          borderRadius: '10px',
          padding: '24px',
        }}
      >
        {/* <form> */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row',
              gap: '8px',
            }}
          >
            <span style={{ fontWeight: 450, color: '#333333' }}>
              Select some NFTs
            </span>
            <hr
              style={{
                // color: '#333333',
                // marginLeft: '8px',
                backgroundColor: '#333333',
                width: '100%',
                height: '1px',
                border: 0,
                opacity: '10%',
              }}
            />
          </div>
          <span style={{ color: '#333333' }}>
            Below is a listing of NFTs owned by one or more wallets in linked to
            your passport. Select an NFT and click confirm to make the NFT part
            of your public passport.
          </span>
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
          <hr
            style={{
              // color: '#333333',
              // marginLeft: '8px',
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
              flexDirection: 'row',
              gap: '8px',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              // marginTop: '24px',
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
                      'image-url':
                        selectedMedia.gateway || selectedMedia.thumbnail || '?',
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
                  if (selectedMedia.gateway || selectedMedia.thumbnail) {
                    saveContact({
                      ...currentPassport.contact,
                      avatar: {
                        type: 'nft',
                        img:
                          selectedMedia.gateway ||
                          selectedMedia.thumbnail ||
                          '',
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
        </div>
        {/* </form> */}
      </dialog>
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
  const [lastError, setLastError] = useState<string>('');
  const [deviceWallet, setDeviceWallet] = useState<{
    mnemonic: string;
    address: string;
    privateKey: string;
  } | null>(null);
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
    fetch(`${shipUrl}/passport/our`, {
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
        const deviceKey = localStorage.getItem(
          '/holium/realm/passport/device-signing-key'
        );
        console.log([passport, deviceKey]);
        setPassport(passport);
        if (passport.chain.length === 0 && !deviceKey) {
          const { mnemonic, address, privateKey } = generateDeviceWallet();
          setDeviceWallet({ mnemonic, address, privateKey });
          setPageState('get-started');
        } else if (passport.addresses.length === 0 && deviceKey) {
          setPageState('device-inconsistent');
        } else if (passport.addresses.length > 0 && !deviceKey) {
          setPageState('passport-inconsistent');
        }
        // else if (
        //   passport.chain.length > 0 &&
        //   passport.addresses[0].address !== deviceKey
        // ) {
        //   /* don't do anything here. if the user gets in this state, any
        //      attempts to sign transactions and submit will fail server side */
        // }
        else {
          console.log('setting passport => %o', passport);
          setPageState('edit-passport');
        }
      })
      .catch((e) => {
        console.error(e);
        // setPageMode('error');
      });
  }, []);

  console.log('render => %o', pageState);

  return (
    <>
      {passport && pageState === 'edit-passport' ? (
        <>
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
          <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
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
                    signingAddress: deviceWallet.address,
                    mnemonic: deviceWallet.mnemonic,
                    readyState,
                    onConfirm: () => {
                      setReadyState('loading');
                      console.log('onConfirm called');
                      addDevice(shipUrl, shipName, deviceWallet.mnemonic)
                        .then((response: PassportProfile) => {
                          console.log(response);
                          if (response.addresses.length > 0) {
                            localStorage.setItem(
                              '/holium/realm/passport/device-signing-key',
                              deviceWallet.privateKey
                            );
                            setReadyState('ready');
                            setPageState('edit-passport');
                          } else {
                            console.warn(
                              'warning: createDevice call succeeded. but no address found in response'
                            );
                          }
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
      {pageState === 'device-inconsistent' ||
        (pageState === 'passport-inconsistent' && (
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
              {renderError(
                pageState,
                readyState,
                words,
                setWords,
                (pageState: string) => {
                  if (pageState === 'device-inconsistent') {
                    setReadyState('loading');
                    localStorage.removeItem(
                      '/holium/realm/passport/device-signing-key'
                    );
                    const { mnemonic, address, privateKey } =
                      generateDeviceWallet();
                    setDeviceWallet({ mnemonic, address, privateKey });
                    setPageState('get-started');
                    setReadyState('ready');
                  } else if (pageState === 'passport-inconsistent') {
                    const { mnemonic, address, privateKey } = recoverWallet(
                      words.join(' ')
                    );
                    setDeviceWallet({ mnemonic, address, privateKey });
                    setPageState('get-started');
                  }
                }
              )}
            </div>
          </div>
        ))}
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
        <>
          We were able to find a device key associated with this browser;
          however it seems your passport does not contain any addresses. This
          inconsistent state will prevent Passport from functioning properly.
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
        </>
      );

    case 'passport-inconsistent':
      return RenderDeviceKeyRecovery({ readyState, words, setWords, onAction });
  }
}
