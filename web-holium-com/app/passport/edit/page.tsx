'use client';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal, useWeb3Modal } from '@web3modal/react';
import {
  configureChains,
  createConfig,
  useAccount,
  useWalletClient,
  WagmiConfig,
} from 'wagmi';
import { arbitrum, mainnet } from 'wagmi/chains';
import {
  Network,
  Alchemy,
  Media,
  OwnedNftsResponse,
  OwnedNft,
} from 'alchemy-sdk';

import { PlusIcon } from '@/app/assets/icons';
// import "../styles.css";
import { shipUrl } from '@/app/lib/shared';
import { createEpochPassportNode } from '@/app/lib/wallet';
import { PassportProfile } from '@/app/lib/types';
import { SocialButton } from '@/app/assets/styled';

const chains = [arbitrum, mainnet];
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

interface PassportEditorProps {
  passport: PassportProfile;
}

function PassportEditor(props: PassportEditorProps) {
  const { open } = useWeb3Modal();
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { address /*isConnected */, connector } = useAccount({
    // @ts-ignore
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected });
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const displayNameRef = useRef<HTMLInputElement>(null);
  const [nfts, setNFTs] = useState<OwnedNft[]>([]);
  const [displayName, setDisplayName] = useState<string>(
    props.passport?.contact['display-name'] ||
      props.passport?.contact?.ship ||
      ''
  );
  const [bio, setBio] = useState<string>(props.passport?.contact?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [ourNFTs, setOurNFTs] = useState<object>({});

  const onSaveClick = (e: any) => {
    e.preventDefault();
    // generate a new opengraph image using canvas
    let canvas: HTMLCanvasElement = document.createElement(
      'canvas'
    ) as HTMLCanvasElement;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    let avatarImage: HTMLImageElement | null = document.getElementById(
      'avatar-image'
    ) as HTMLImageElement;
    ctx.drawImage(avatarImage, 20, 20);
    ctx.moveTo(40, 20);
    let displayName: HTMLInputElement | null = document.getElementById(
      'display-name'
    ) as HTMLInputElement;
    let metrics = ctx.measureText(displayName.value);
    ctx.strokeText(displayName.value, 0, 0, 300);
    let textHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    ctx.moveTo(40, 20 + textHeight + 8);
    let patp: HTMLDivElement | null = document.getElementById(
      'patp'
    ) as HTMLDivElement;
    ctx.strokeText(patp?.innerText || '', 0, 0, 300);
    let dataUrl: string = canvas.toDataURL('img/png');
    canvas;
  };

  const onPhotoUpload = (e: any) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.addEventListener('change', filesChanged);
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    alchemy.nft
      // .getNftsForOwner(wallet.pubkey)
      .getNftsForOwner('0x653b9EA6AC3d6424a2eC360BA8E93FfaAfdA8CA1')
      .then((response: OwnedNftsResponse) => {
        let nfts = [];
        for (let i = 0; i < response.ownedNfts.length; i++) {
          let ownedNft = response.ownedNfts[i];
          nfts.push({ ...ownedNft });
        }
        setNFTs(nfts);
      });
  }, []);

  useEffect(() => {
    if (props.passport.addresses) {
      props.passport.addresses.map((wallet, idx) => {
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
  }, [props.passport['default-address'], props.passport.addresses]);

  useEffect(() => {
    if (isError) {
      console.error('error loading wallet client');
      return;
    }
    if (!isLoading && address && connector) {
      console.log('connector: %o', connector?.name);
      console.log('address loaded: %o', address);
      createEpochPassportNode(shipUrl, connector.name, walletClient, address)
        .then((result) =>
          console.log('createEpochPassportNode response => %o', result)
        )
        .catch((e) => console.error(e));
      alchemy.nft
        .getNftsForOwner(address)
        .then((meta: OwnedNftsResponse) => console.log(meta))
        .catch((e) => console.error(e));
    }
  }, [address, walletClient, isError, isLoading]);

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
        <SocialButton onClick={() => dialogRef.current?.showModal()}>
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
                            ourNFTs.hasOwnProperty(media.thumbnail)) ||
                          false
                        }
                        nft={nft}
                        media={media}
                        onSelectionChange={(
                          e: ChangeEvent<HTMLInputElement>,
                          thumbnail: string
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
              <SocialButton onClick={open}>Add Address</SocialButton>
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
        id="nftPicker"
        ref={dialogRef}
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
              dialogRef.current?.close();
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
              dialogRef.current?.close(selectedAvatar);
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
      .then((data: PassportProfile) => {
        console.log(data);
        // parse the cookie and extract the ship name. if the ship
        //  name in the cookie matches the ship name returned by the our-passport.json
        //  call, enable edit functionality
        if (document.cookie) {
          const pairs = document.cookie.split(';');
          for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            const key = pair[0].trim();
            if (key === `urbauth-${data.contact?.ship}`) {
              // setCanEdit(true);
              break;
            }
          }
        }
        setPassport(data);
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
