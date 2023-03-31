import { useMemo, useState } from 'react';
import { Flex, Text } from '../../general';
import { BlockProps, Block } from '../Block/Block';
import { FragmentImage } from '../Bubble/fragment-lib';

type ImageBlockProps = {
  showLoader?: boolean;
  image: string;
  by: string;
  onImageLoaded?: () => void;
} & BlockProps;

export const ImageBlock = (props: ImageBlockProps) => {
  const {
    showLoader,
    image,
    by,
    variant,
    width = 'inherit',
    height,
    // eslint-disable-next-line unused-imports/no-unused-vars
    onImageLoaded,
    ...rest
  } = props;
  const [isLoaded, setIsLoaded] = useState(false);
  const parsedHeight = useMemo(
    () =>
      (height
        ? typeof height === 'number'
          ? `${height}px`
          : height
        : '100%') as string,
    [height]
  );

  const parsedWidth = useMemo(
    () =>
      (width
        ? typeof width === 'number'
          ? `${width}px`
          : width
        : 'fit-content') as string,
    [width]
  );

  return (
    <Block variant={variant} width={width} {...rest}>
      <FragmentImage
        id={rest.id}
        loading="eager"
        {...(showLoader && { isSkeleton: !isLoaded })}
        src={image}
        height={parsedHeight}
        width={parsedWidth}
        draggable={false}
        onLoad={() => {
          if (showLoader) {
            onImageLoaded && onImageLoaded();
            setIsLoaded(true);
          }
        }}
        onError={() => {
          // setIsError(true);
        }}
      />
      {by && (
        <Flex className="block-footer">
          <Flex></Flex>
          <Text.Hint className="block-author" noSelection fontSize={0}>
            {by}
          </Text.Hint>
        </Flex>
      )}
    </Block>
  );
};
