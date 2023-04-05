import { useMemo, useState } from 'react';
import { Flex, Text } from '../../general';
import { BlockProps, Block } from '../Block/Block';
import { FragmentImage } from '../Bubble/fragment-lib';
import 'photoswipe/dist/photoswipe.css';
import { Item } from 'react-photoswipe-gallery';

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
  const [naturalWidth, setNaturalWidth] = useState(320);
  const [naturalHeight, setNaturalHeight] = useState(427);
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
      <Item
        original={image}
        thumbnail={image}
        width={naturalWidth}
        height={naturalHeight}
      >
        {({ ref, open }) => (
          <FragmentImage
            id={rest.id}
            ref={ref as React.MutableRefObject<HTMLImageElement>}
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
              const curr = ref && (ref.current as HTMLImageElement);
              if (curr && curr.naturalWidth) setNaturalWidth(curr.naturalWidth);
              if (curr && curr.naturalHeight)
                setNaturalHeight(curr.naturalHeight);
            }}
            onClick={open}
            onError={() => {
              // setIsError(true);
            }}
          />
        )}
      </Item>
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
