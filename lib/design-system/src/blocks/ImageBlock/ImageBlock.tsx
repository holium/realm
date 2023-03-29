import { FC, useLayoutEffect, useState } from 'react';
import { Flex, Text } from '../..';
import { BlockProps, Block } from '../Block/Block';
import { FragmentImage } from '../Bubble/fragment-lib';

type ImageBlockProps = {
  image: string;
  by: string;
  onImageLoaded?: () => void;
} & BlockProps;

export const ImageBlock: FC<ImageBlockProps> = (props: ImageBlockProps) => {
  const {
    image,
    by,
    variant,
    width = 'inherit',
    height,
    onImageLoaded,
    ...rest
  } = props;
  const [imgLoaded, setImgLoaded] = useState(false);

  const isPrecalculated =
    typeof height === 'number' && typeof width === 'number';

  useLayoutEffect(() => {
    if (!isPrecalculated && onImageLoaded) onImageLoaded();
  });

  const parsedHeight = (
    height ? (typeof height === 'number' ? `${height}px` : height) : '100%'
  ) as string;

  const parsedWidth = (
    width ? (typeof width === 'number' ? `${width}px` : width) : 'fit-content'
  ) as string;

  return (
    <Block variant={variant} width={width} {...rest}>
      <FragmentImage
        id={rest.id}
        isSkeleton={!imgLoaded}
        src={image}
        height={parsedHeight}
        width={parsedWidth}
        draggable={false}
        onError={() => {
          if (!isPrecalculated && onImageLoaded) onImageLoaded();
        }}
        onLoad={() => {
          setImgLoaded(true);
          if (!isPrecalculated && onImageLoaded) onImageLoaded();
        }}
      />
      <Flex className="block-footer">
        <Flex></Flex>
        <Text.Hint className="block-author" noSelection fontSize={0}>
          {by}
        </Text.Hint>
      </Flex>
    </Block>
  );
};
