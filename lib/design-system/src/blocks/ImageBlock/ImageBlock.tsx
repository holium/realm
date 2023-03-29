import { FC, useState } from 'react';
import { Flex, Text } from '../..';
import { BlockProps, Block } from '../Block/Block';
import { FragmentImage } from '../Bubble/fragment-lib';

type ImageBlockProps = {
  image: string;
  by: string;
} & BlockProps;

export const ImageBlock: FC<ImageBlockProps> = (props: ImageBlockProps) => {
  const { image, by, variant, width = 'inherit', onLoaded, ...rest } = props;
  const [imgLoaded, setImgLoaded] = useState(false);

  const parsedHeight = (
    rest.height
      ? typeof rest.height === 'number'
        ? `${rest.height}px`
        : rest.height
      : '100%'
  ) as string;

  const shouldMeasure = !rest.height && !width;

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
          // TODO: handle error using placeholder image
          if (shouldMeasure) {
            onLoaded && onLoaded();
          }
        }}
        onLoad={() => {
          setImgLoaded(true);
          if (shouldMeasure) {
            onLoaded && onLoaded();
          }
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
