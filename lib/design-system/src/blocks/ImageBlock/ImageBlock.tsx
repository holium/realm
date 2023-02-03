import { FC, useState } from 'react';
import { Flex, Text } from '../..';
import { BlockProps, Block } from '../Block/Block';
import { FragmentImage } from '../Bubble/fragment-lib';

type ImageBlockProps = {
  image: string;
  by: string;
} & BlockProps;

export const ImageBlock: FC<ImageBlockProps> = (props: ImageBlockProps) => {
  const { image, by, variant, width = 'inherit', ...rest } = props;
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Block variant={variant} width={width} {...rest}>
      <FragmentImage
        isSkeleton={!imgLoaded}
        src={image}
        draggable={false}
        onError={(evt: React.SyntheticEvent<HTMLImageElement, Event>) => {
          // TODO: handle error using placeholder image
        }}
        onLoad={() => setImgLoaded(true)}
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
