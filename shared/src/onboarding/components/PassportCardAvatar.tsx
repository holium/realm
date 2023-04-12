import { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { useToggle } from '@holium/design-system/util';
import { Flex, Avatar, Button, Icon } from '@holium/design-system/general';
import { AddImageIcon } from '../icons/AddImageIcon';
import { MOBILE_WIDTH, OnboardDialogDescription } from './OnboardDialog.styles';

const AvatarBox = styled(Flex)<{ isSelected: boolean }>`
  width: 54px;
  height: 54px;
  border: 2px solid transparent;
  background-color: rgba(var(--rlm-border-rgba));
  ${({ isSelected }) =>
    isSelected &&
    css`
      border: 2px solid rgba(var(--rlm-accent-rgba), 0.4);
    `};
`;

const GeneratedImage = styled.img<{ size?: number }>`
  width: ${({ size = 50 }) => size}px;
  height: ${({ size = 50 }) => size}px;
  border-radius: var(--rlm-border-radius-4);
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
const defaultImages = [
  'https://images.unsplash.com/photo-1564292284419-a82fe631db14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1663889824646-dfc296de33dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1515405295579-ba7b45403062?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1521400383156-1e315f1f7b94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1511181832407-791900ec318e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1589383544287-a670dcc9d242?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1615378536579-61c7d173e8a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1610294517329-d4aac71cd302?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1555546415-c5c9b54f70f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1654361392270-563e41676c0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1600531185345-2195d5c47dcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1679407509869-95d525d7caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1564053051381-5cb91813736b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1645583918683-39fd75293e80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1562898616-c98aa0ccf42a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1570356402261-a5bf3841e998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
  'https://images.unsplash.com/photo-1508767887031-185bbeb45718?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MzUxODl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODEzMTYyNTc&ixlib=rb-4.0.3&q=80&w=400',
];

type Props = {
  patp: string;
  onSetAvatar: (url?: string) => void;
};

export const PassportCardAvatar = ({ patp, onSetAvatar }: Props) => {
  const avatarModal = useToggle(true);
  const [generatedImages, setGeneratedImages] =
    useState<string[]>(defaultImages);

  const [selectedImage, setSelectedImage] = useState(0);

  const modalButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const refreshImages = async () => {
    setSelectedImage(0);
    // const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    // const apiKey = 'I6E9qHPG0kE-vtOzR3Jbpj1mAAOgYtBpIkdAVwVIOrw';
    // const apiUrl = `https://api.unsplash.com/photos/random?client_id=${apiKey}&query=${keyword}&orientation=squarish&count=19`;
    // fetch(apiUrl)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     const newImages = data.map((image: any) => image.urls.small);
    //     setGeneratedImages(newImages);
    //   })
    //   .catch((error) => console.log(error));
  };

  const handleSetAvatar = (index: number) => {
    setSelectedImage(index);
    if (index === 0) {
      onSetAvatar(undefined);
    } else {
      onSetAvatar(generatedImages[index - 1]);
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
            <SourceText>unsplash.com</SourceText>
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
            {generatedImages.map((src, index) => (
              <AvatarBox
                key={index + 1}
                isSelected={selectedImage === index + 1}
                onClick={() => handleSetAvatar(index + 1)}
              >
                <GeneratedImage src={src} />
              </AvatarBox>
            ))}
          </div>
        </PassportAvatarModal>
      )}
      <AddImageButton
        type="button"
        ref={modalButtonRef}
        onClick={avatarModal.toggleOn}
      >
        <AddImageIcon />
      </AddImageButton>
      {selectedImage === 0 ? (
        <Avatar patp={patp} sigilColor={['black', 'white']} size={68} />
      ) : (
        <GeneratedImage src={generatedImages[selectedImage - 1]} size={68} />
      )}
    </Flex>
  );
};
