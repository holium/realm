import { ChangeEvent, useEffect, useState } from 'react';
import { Media, OwnedNft } from 'alchemy-sdk';
import { Wallet } from 'ethers';
import Image from 'next/image';
import styled from 'styled-components';

import { CopyIcon, PlusIcon, SmallPlusIcon, WalletIcon } from '../assets/icons';
import { SocialButton } from '../assets/styled';
import { saveContact } from '../lib/profile';
import { supportedWallets } from '../lib/shared';
import { LinkedNFT, PassportProfile } from '../lib/types';
import { addNft, loadNfts, OwnerNft } from '../lib/wallet';
import { renderAddress } from '../passport/edit/workflow';

type Props = {
  size: number;
  width?: number;
  color?: string;
};

export const StyledSpinner = styled.div<Props>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-width: ${({ size, width }) => {
    if (width) return width;

    return size < 2 ? 0.75 : 5;
  }}px;
  border-style: solid;
  // TODO: get brand color from a CSS variable.
  border-color: rgba(117, 117, 117, 0.2);
  border-bottom-color: ${({ color }) => color ?? '#ef9134'};
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const Flex = styled.div<Props>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-width: ${({ size, width }) => {
    if (width) return width;

    return size < 2 ? 0.75 : 5;
  }}px;
  border-style: solid;
  // TODO: get brand color from a CSS variable.
  border-color: rgba(117, 117, 117, 0.2);
  border-bottom-color: ${({ color }) => color ?? '#ef9134'};
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

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
        <Image
          alt={'nft'}
          src={nft['image-url']}
          style={{
            height: '115px',
            width: '115px',
            borderRadius: '8px',
          }}
        ></Image>
      )}
    </div>
  );
};

type NftListProps = {
  passport: PassportProfile;
  onAddNftClick: () => void;
};
export const NftList = ({ passport, onAddNftClick }: NftListProps) => {
  const [nfts, setNFTs] = useState<OwnerNft[]>([]);
  const [readyState, setReadyState] = useState<'ready' | 'loading' | 'error'>(
    'ready'
  );

  useEffect(() => {
    setReadyState('loading');
    loadNfts(passport)
      .then((nfts) => {
        setNFTs(nfts);
        setReadyState('ready');
      })
      .catch((e) => {
        console.error(e);
        setReadyState('error');
      });
  }, [passport]);

  let content = <></>;

  if (readyState === 'error') {
    content = (
      <div style={{ display: 'flex', color: '#FF6E6E' }}>
        error loading nfts
      </div>
    );
  }

  if (readyState === 'loading') {
    content = (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'left',
          gap: '4px',
          fontSize: '0.9em',
        }}
      >
        <StyledSpinner color="#FF6E6E" size={12} width={1.5} />
        <span>Please wait. Loading nfts...</span>
      </div>
    );
  }

  if (readyState === 'ready') {
    content = (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {passport.addresses.length > 1 && nfts.length > 0 ? (
          <>
            <>
              {passport.nfts.map((nft: LinkedNFT, idx: number) => (
                <NFT key={`owned-nft-${idx}`} selectable={false} nft={nft} />
              ))}
            </>
            <button
              style={{
                width: '115px',
                height: '115px',
                borderRadius: '8px',
                background: 'rgba(78, 158, 253, 0.08)',
              }}
              onClick={() => onAddNftClick && onAddNftClick()}
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
        ) : passport.addresses.length > 1 && nfts.length === 0 ? (
          <>There are no NFTs owned by any of your linked wallets.</>
        ) : (
          <>To add NFTs, please link at least one wallet.</>
        )}
      </div>
    );
  }

  return content;
};

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
            <Image
              alt={'nft'}
              src={media.gateway || media.thumbnail || ''}
              style={{
                height: '115px',
                width: '115px',
                borderRadius: '8px',
              }}
            ></Image>
          )}
        </div>
      </button>
    </>
  );
};

interface LinkedWalletListProps {
  passport: PassportProfile;
  onAddAddressClick: () => void;
}

export const LinkedWalletList = ({
  passport,
  onAddAddressClick,
}: LinkedWalletListProps) => {
  return passport.addresses?.filter((entry) => !(entry.wallet === 'account'))
    .length > 0 ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <>
        {passport.addresses
          ?.filter((entry) => {
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
              <Image
                style={{
                  borderRadius: '4px',
                  width: '20px',
                  height: '20px',
                }}
                src={supportedWallets[entry.wallet]?.image_url || ''}
                alt={entry.wallet}
              ></Image>
              <div style={{ flex: 1 }}>
                {renderAddress(entry.address as `0x${string}`)}
              </div>
              {passport['default-address'] === entry.address && (
                <div style={{ color: '#878889' }}>Public</div>
              )}
              <button
                onClick={() => navigator.clipboard.writeText(entry.address)}
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
  );
};

interface LinkedDeviceListProps {
  passport: PassportProfile;
}

export const DeviceAddressList = ({ passport }: LinkedDeviceListProps) => {
  return passport.addresses?.filter((entry) => entry.wallet === 'account')
    .length > 0 ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <>
        {passport.addresses
          ?.filter((entry) => entry.wallet === 'account')
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
                onClick={() => navigator.clipboard.writeText(entry.address)}
              >
                <CopyIcon fill={'#9FA1A1'} />
              </button>
            </div>
          ))}
      </>
    </div>
  ) : (
    <>No device address</>
  );
};

interface NftPickerContentProps {
  editMode: 'add-nft' | 'choose-nft';
  nfts: OwnerNft[];
  deviceWallet?: Wallet;
  passport: PassportProfile;
  onClose: (passport?: PassportProfile) => void;
}

export const NftPickerContent = ({
  editMode,
  nfts,
  deviceWallet,
  passport,
  onClose,
}: NftPickerContentProps) => {
  const [readyState, setReadyState] = useState<string>('ready');
  const [selectedNft, setSelectedNft] = useState<OwnerNft | undefined>(
    undefined
  );
  const [selectedMedia, setSelectedMedia] = useState<Media | undefined>(
    undefined
  );

  const onConfirmClick = (e: any) => {
    e.preventDefault();

    if (!deviceWallet) {
      console.error('no device wallet');
      return;
    }
    if (!(selectedNft && selectedMedia)) return;
    if (editMode === 'add-nft') {
      addNft(deviceWallet, [
        ...passport.nfts,
        {
          'token-standard': selectedNft.tokenType,
          name: selectedNft.title || selectedNft?.rawMetadata?.name || 'error',
          'contract-address': selectedNft.contract.address,
          'token-id': selectedNft.tokenId,
          'image-url': selectedMedia.gateway || selectedMedia.thumbnail || '?',
          'chain-id': 'eth-mainnet',
          'owned-by': selectedNft.ownerAddress,
        },
      ])
        .then((result: any) => {
          if (result.term === 'poke-fail') {
            console.error('error => %o', result.tang[0]);
            return;
          }
          onClose && onClose(result as PassportProfile);
        })
        .catch((e) => {
          console.error(e);
        });
    } else if (editMode === 'choose-nft') {
      if (selectedMedia.gateway || selectedMedia.thumbnail) {
        setReadyState('loading');
        saveContact({
          ...passport.contact,
          avatar: {
            type: 'nft',
            img: selectedMedia.gateway || selectedMedia.thumbnail || '',
          },
        })
          .then((response) => {
            if (response.term === 'poke-fail') {
              throw new Error(response.term);
            }
            onClose && onClose(response as PassportProfile);
          })
          .catch((e) => {
            console.error(e);
            setReadyState('error');
          });
      }
    }
  };

  return (
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
        your passport. Select an NFT and click confirm to make the NFT part of
        your public passport.
      </span>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row',
          gap: '8px',
        }}
      >
        {nfts.map((nft: OwnerNft, _idx: number) =>
          nft.media.map((media: Media, idx: number) => (
            <OwnedNFT
              key={`owned-nft-${idx}`}
              selectable={true}
              isSelected={selectedMedia === media}
              nft={nft}
              media={media}
              onSelectionChange={(media: Media) => {
                setSelectedNft(nft);
                setSelectedMedia(media);
              }}
            />
          ))
        )}
      </div>
      <hr
        style={{
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
          justifyContent: 'right',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
          <SocialButton
            formMethod="dialog"
            value="cancel"
            onClick={(e: any) => {
              e.preventDefault();
              onClose && onClose();
            }}
          >
            Cancel
          </SocialButton>
          <SocialButton
            id="confirmButton"
            value="default"
            onClick={onConfirmClick}
          >
            {readyState === 'loading' ? (
              <StyledSpinner color="#FFFFFF" size={12} width={1.5} />
            ) : (
              <>Confirm</>
            )}
          </SocialButton>
        </div>
      </div>
    </div>
  );
};
