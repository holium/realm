import { MutableRefObject, useMemo, useState } from 'react';
import { Item } from 'react-photoswipe-gallery';

import { Block, BlockProps } from '../Block/Block';
import { FragmentImage } from '../Bubble/renderFragment.styles';

type ImageBlockProps = {
  showLoader?: boolean;
  image: string;
  by: string;
} & BlockProps;

export const ImageBlock = ({
  id,
  showLoader,
  image,
  variant,
  width = 'inherit',
  height,
  ...rest
}: ImageBlockProps) => {
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
    <Block id={id} variant={variant} width={width} {...rest}>
      <Item
        original={image}
        thumbnail={image}
        width={naturalWidth}
        height={naturalHeight}
      >
        {({ ref, open }) => (
          <FragmentImage
            id={id}
            className="fragment-image"
            ref={ref as MutableRefObject<HTMLImageElement>}
            loading="eager"
            {...(showLoader && { isSkeleton: !isLoaded })}
            src={image}
            height={parsedHeight}
            width={parsedWidth}
            draggable={false}
            onLoad={() => {
              if (showLoader) {
                setIsLoaded(true);
              }
              const curr = ref && (ref.current as HTMLImageElement);
              if (curr && curr.naturalWidth) setNaturalWidth(curr.naturalWidth);
              if (curr && curr.naturalHeight)
                setNaturalHeight(curr.naturalHeight);
            }}
            onClick={open}
          />
        )}
      </Item>
    </Block>
  );
};
