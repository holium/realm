import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { useToggle } from '@holium/design-system/util';
import {
  Flex,
  Avatar,
  Button,
  Icon,
  Spinner,
  ErrorBox,
} from '@holium/design-system/general';
import { Input } from '@holium/design-system/inputs';
import { AddImageIcon } from '../icons/AddImageIcon';
import { MOBILE_WIDTH, OnboardDialogDescription } from './OnboardDialog.styles';
import { defaultImages } from './passportCardDefaultImages';

const AvatarBox = styled(Flex)<{ isSelected: boolean }>`
  width: 54px;
  height: 54px;
  border: 2px solid transparent;
  border-radius: var(--rlm-border-radius-4);
  background-color: rgba(var(--rlm-border-rgba));
  cursor: pointer;

  ${({ isSelected }) =>
    isSelected &&
    css`
      border: 2px solid rgba(var(--rlm-accent-rgba), 0.4);
    `};
`;

const FileInput = styled(Input)`
  display: flex;
  flex: 1;
  align-items: center;
  padding: 14px;
  max-width: 230px;
`;

const Divider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 12px 0;
  border: none;
  background-color: rgba(var(--rlm-icon-rgba), 0.2);
`;

const CustomImage = styled.img<{ size?: number }>`
  width: ${({ size = 50 }) => size}px;
  height: ${({ size = 50 }) => size}px;
  border-radius: var(--rlm-border-radius-4);
  object-fit: cover;
`;

const SourceText = styled(OnboardDialogDescription)`
  font-size: 11px;
  text-decoration: underline;
  user-select: none;
`;

const PassportAvatarModal = styled.div`
  position: absolute;
  top: 0;
  left: 80px;
  padding: 12px;
  border-radius: 9px;
  border: 1px solid rgba(var(--rlm-border-rgba));
  box-shadow: var(--rlm-box-shadow-3);
  background-color: rgba(var(--rlm-window-rgba));
  z-index: 1;

  @media screen and (max-width: ${MOBILE_WIDTH}px) {
    left: 0;
  }
`;

const AddImageButton = styled(Button.IconButton)`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(var(--rlm-input-rgba));

  &:hover:not(:disabled) {
    filter: brightness(0.9);
    background: rgba(var(--rlm-input-rgba));
  }
`;

const keywords = ['art', 'space', 'horizon', 'animal'];
const headers = {
  Authorization: `Client-ID ${process.env.UNSPLASH_KEY}`,
};

type Props = {
  patp: string;
  setAvatarSrc: (src?: string) => void;
  onUploadFile: (file: File) => Promise<string | undefined>;
};

export const PassportCardAvatar = ({
  patp,
  setAvatarSrc,
  onUploadFile,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarModal = useToggle(false);
  const [generatedImages, setGeneratedImages] = useState<
    {
      src: string;
      author: string;
      authorLink: string;
      downloadLink: string;
    }[]
  >();
  const [author, setAuthor] = useState<string>();
  const [authorLink, setAuthorLink] = useState<string>();

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [uploadedImage, setUploadedImage] = useState<string>();

  const uploading = useToggle(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const modalButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const refreshImages = async () => {
    if (selectedImage < 21) setSelectedImage(0);
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    const apiUrl = `https://api.unsplash.com/photos/random?query=${keyword}&orientation=squarish&count=19`;
    fetch(apiUrl, { headers })
      .then((response) => response.json())
      .then((data) => {
        const newImages = data.map((image: any) => ({
          src: image.urls.small,
          author: image.user.name,
          authorLink: `${image.user.links.html}?utm_source=Realm&utm_medium=referral`,
          downloadLink: image.links.download_location,
        }));
        setGeneratedImages(newImages);
      })
      .catch((error) => {
        console.log(error);
        setGeneratedImages(defaultImages);
      });
  };

  const handleSetAvatar = (index: number) => {
    setSelectedImage(index);
    setUploadedImage(undefined);

    fileInputRef.current?.value && (fileInputRef.current.value = '');

    if (index === 0) {
      setAvatarSrc(undefined);
      setAuthor(undefined);
      setAuthorLink(undefined);
    } else {
      setAvatarSrc(generatedImages?.[index - 1].src);
      setAuthor(generatedImages?.[index - 1].author);
      setAuthorLink(generatedImages?.[index - 1].authorLink);

      // Call download link on select according to Unsplash guidelines.
      if (generatedImages?.[index - 1]?.downloadLink) {
        fetch(generatedImages[index - 1].downloadLink, { headers });
      }
    }
  };

  const onClickSourceText = () => {
    if (authorLink) window.open(authorLink, '_blank');
  };

  const onChooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    uploading.toggleOn();
    setUploadError(null);
    const file = event.target.files?.[0];

    if (file) {
      onUploadFile(file)
        .then((src) => {
          if (src) {
            setAvatarSrc(src);
            setUploadedImage(src);

            setAuthor(undefined);
            setAuthorLink(undefined);
          }
        })
        .catch(() => {
          setUploadError('Failed to upload image');
        })
        .finally(uploading.toggleOff);
    }
  };

  useEffect(() => {
    refreshImages();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalButtonRef.current &&
        modalRef.current &&
        !modalButtonRef.current.contains(event.target as Node) &&
        !modalRef.current.contains(event.target as Node)
      ) {
        avatarModal.toggleOff();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, avatarModal]);

  return (
    <Flex position="relative" width={68}>
      {avatarModal.isOn && (
        <PassportAvatarModal ref={modalRef}>
          <Flex justifyContent="space-between" alignItems="center" mb="8px">
            <SourceText onClick={onClickSourceText}>
              unsplash.com{author && ` / ${author}`}
            </SourceText>
            <Button.IconButton type="button" onClick={refreshImages}>
              <Icon name="Refresh" size={16} />
            </Button.IconButton>
          </Flex>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '6px',
            }}
          >
            <AvatarBox
              isSelected={selectedImage === 0}
              onClick={() => handleSetAvatar(0)}
            >
              <Avatar patp={patp} sigilColor={['black', 'white']} size={50} />
            </AvatarBox>
            {generatedImages?.map(({ src }, index) => (
              <AvatarBox
                key={index + 1}
                isSelected={selectedImage === index + 1}
                onClick={() => handleSetAvatar(index + 1)}
              >
                <CustomImage
                  src={src}
                  alt={`Avatar ${index + 1} by ${author}`}
                />
              </AvatarBox>
            ))}
          </div>
          <Divider />
          <Flex flexDirection="column" alignItems="center" gap={8} my={16}>
            <OnboardDialogDescription>
              Upload a custom image
            </OnboardDialogDescription>
            <Flex>
              {uploading.isOn && <Spinner size={4} />}
              {uploadedImage && <CustomImage src={uploadedImage} />}
              <FileInput
                ref={fileInputRef}
                type="file"
                onChange={onChooseFile}
              />
            </Flex>
            {uploadError && <ErrorBox>{uploadError}</ErrorBox>}
          </Flex>
        </PassportAvatarModal>
      )}
      <AddImageButton
        type="button"
        ref={modalButtonRef}
        onClick={avatarModal.toggleOn}
      >
        <AddImageIcon />
      </AddImageButton>
      {selectedImage === 0 && (
        <Avatar patp={patp} sigilColor={['black', 'white']} size={68} />
      )}
      {selectedImage > 0 && selectedImage < 21 && (
        <CustomImage src={generatedImages?.[selectedImage - 1].src} size={68} />
      )}
      {uploadedImage && <CustomImage src={uploadedImage} size={68} />}
    </Flex>
  );
};
