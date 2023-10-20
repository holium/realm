'use client';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { EthereumClient, w3mProvider } from '@web3modal/ethereum';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { useWeb3Modal, Web3Modal } from '@web3modal/react';
import {
  Alchemy,
  Media,
  Network,
  OwnedNft,
  OwnedNftsResponse,
} from 'alchemy-sdk';
import {
  configureChains,
  createConfig,
  useAccount,
  useWalletClient,
  WagmiConfig,
} from 'wagmi';
import { mainnet } from 'wagmi/chains';

import {
  WorkflowStep,
  PassportWorkflowState,
  renderAddress,
  RenderWorkflowLinkAddressStep,
  RenderWorkflowNoneState,
  RenderGetStartedStep,
  PageReadyState,
  RenderDeviceKeyRecovery,
} from './workflow';

import {
  CopyIcon,
  ErrorIcon,
  PlusIcon,
  SmallPlusIcon,
  WalletIcon,
} from '@/app/assets/icons';
import { SocialButton } from '@/app/assets/styled';
import { shipName, shipUrl, supportedWallets } from '@/app/lib/shared';
import { ContactInfo, LinkedNFT, PassportProfile } from '@/app/lib/types';
import {
  addDevice,
  addNFT,
  addWallet,
  encryptWallet,
  generateDeviceWallet,
  recoverDeviceWallet,
  walletFromKey,
} from '@/app/lib/wallet';
import { saveContact } from '@/app/lib/profile';
import { useRouter } from 'next/navigation';
import { StyledSpinner } from '@/app/components';
import { savePassportOpenGraphImage, uploadDataURL } from '@/app/lib/storage';
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

type OwnerNft = OwnedNft & { ownerAddress: string };

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
  // const { disconnect, disconnectAsync } = useDisconnect();
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
  const [nfts, setNFTs] = useState<OwnerNft[]>([]);
  const [displayName, setDisplayName] = useState<string>(
    passport?.contact['display-name'] || passport?.contact?.ship || ''
  );
  const [bio, setBio] = useState<string>(passport?.contact?.bio || '');
  const [selectedNft, setSelectedNft] = useState<OwnerNft | undefined>(
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
        setAvatar(url);
      });
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const onSaveClick = (e: any) => {
    e.preventDefault();
    // generate a new opengraph image using canvas
    const canvas: HTMLCanvasElement = document.createElement(
      'canvas'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const avatar: HTMLImageElement | null = document.getElementById(
      'avatar-image'
    ) as HTMLImageElement;
    let avatarImage = new Image();
    avatarImage.src = avatar.src;
    avatarImage.crossOrigin = 'anonymous';
    avatarImage.onload = () => {
      let rubik = new FontFace(
        'Rubik',
        'url(https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFV0U1dYPFkZVO.woff2)'
      );
      rubik.load().then((font) => {
        document.fonts.add(font);
        canvas.width = 400;
        canvas.height = 140;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(120.0 / avatarImage.width, 120.0 / avatarImage.height);
        ctx.drawImage(avatarImage, 10, 10);
        const displayNameElem: HTMLInputElement | null =
          document.getElementById('display-name') as HTMLInputElement;
        ctx.font = "normal 32px 'Rubik'";
        const metrics = ctx.measureText(displayNameElem.value);
        const textHeight =
          metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        ctx.fillStyle = '#333333';
        ctx.fillText(displayNameElem.value, 212, 10 + textHeight, 300);
        ctx.font = "normal 22px 'Rubik'";
        ctx.fillStyle = '#8e8e8e';
        ctx.fillText(
          'This is for testing purposes only.',
          212,
          10 + textHeight + 10 + textHeight,
          300
        );
        // setTimeout(() => {
        //   ctx.moveTo(0, 0);
        //   ctx.roundRect(0, 0, canvas.width, canvas.height, 10);
        //   ctx.clip();
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        const dataUrl: string = canvas.toDataURL('image/png');
        // console.log('dataUrl => %o', dataUrl);

        // passport snapshot is stored in profile agent
        uploadDataURL(
          `${(window as any).ship || 'development'}-passport`,
          dataUrl
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
        // }, 0);
        // ctx.moveTo(40, 20 + textHeight + 8);
        // const patp: HTMLDivElement | null = document.getElementById(
        //   'patp'
        // ) as HTMLDivElement;
        // ctx.strokeText(patp?.innerText || '', 0, 0, 300);
      });
    };
    // avatarImage.crossOrigin = 'anonymous';
    // ctx.drawImage(avatarImage, 0, 0, 120, 120, 20, 20, 120, 120);

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

  const onCloseWorkflow = () => {
    setWorkflowStep('none');
    passportWorkflow.current?.close();
  };

  const onNextWorkflowStep = async (state: PassportWorkflowState) => {
    return new Promise<void>((resolve, reject) => {
      const encryptedData = localStorage.getItem(
        '/holium/realm/passport/device-signing-data'
      );
      if (!encryptedData) {
        console.error('no device signing encrypted info found');
        return;
      }
      if (walletAddress && walletClient) {
        connector
          ?.getProvider()
          .then((provider) => {
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
            addWallet(
              encryptedData,
              walletClient,
              walletProviderName,
              walletAddress
            )
              // the wallet address of secret/hidden wallet that now lives on this device
              .then((response: any) => {
                if (response.term === 'poke-fail') {
                  reject('error adding wallet');
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
    open({
      view: 'Connect',
      // featuredWalletIds: [Object.keys(supportedWallets)],
      // includedWalletIds: supportedWalletIds,
    });
  };

  async function loadNFTs(passport: PassportProfile) {
    let nfts: OwnerNft[] = [];
    for (let i = 0; i < passport.addresses.length; i++) {
      const address = passport.addresses[i];
      if (address.wallet !== 'account') {
        const res: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(
          address.address
        );
        for (let i = 0; i < res.ownedNfts.length; i++) {
          const ownedNft = res.ownedNfts[i];
          nfts.push({ ...ownedNft, ownerAddress: address.address });
        }
      }
    }
    return nfts;
  }

  useEffect(() => {
    loadNFTs(currentPassport).then((nfts) => setNFTs(nfts));
  }, [currentPassport.addresses.length]);

  useEffect(() => {
    loadNFTs(passport).then((nfts) => setNFTs(nfts));
  }, []);

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
              backgroundColor: '#F2F7FE',
            }}
            // onClick={() => {
            // setEditState('choose-nft');
            // nftPicker.current?.showModal();
            // }}
            // onClick={() => editAvatarMenu.current?.show()}
          >
            {/* <PlusIcon /> */}
          </div>
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
            deviceSigningKey: deviceSigningKey || '',
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
            {nfts.map(
              (nft: OwnedNft & { ownerAddress: string }, _idx: number) =>
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
                if (editState === 'add-nft') {
                  const encryptedDeviceData = localStorage.getItem(
                    '/holium/realm/passport/device-signing-data'
                  );
                  if (!encryptedDeviceData) {
                    console.error('no encrypted device data found');
                    return;
                  }
                  addNFT(encryptedDeviceData, [
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
                      'owned-by': selectedNft.ownerAddress,
                    },
                  ])
                    .then((result: any) => {
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
        const deviceKey = localStorage.getItem(
          '/holium/realm/passport/device-signing-data'
        );
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
          setPageState('edit-passport');
        }
      })
      .catch((e) => {
        console.error(e);
        // setPageMode('error');
      });
  }, []);

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
                const { mnemonic, address, privateKey } =
                  generateDeviceWallet();
                setDeviceWallet({ mnemonic, address, privateKey });
                setPageState('get-started');
                setReadyState('ready');
              } else if (pageState === 'passport-inconsistent') {
                try {
                  const { mnemonic, address, privateKey } = recoverDeviceWallet(
                    words.join(' ')
                  );
                  encryptWallet(privateKey).then((data: string) => {
                    console.log('encrypted wallet: %o', data);
                    localStorage.setItem(
                      '/holium/realm/passport/device-signing-data',
                      data
                    );
                  });
                  setDeviceWallet({ mnemonic, address, privateKey });
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
