import { FC } from 'react';
import { Text } from '../..';
import { BlockProps, Block } from '../Block/Block';
import { FragmentImage } from '../Bubble/fragment-lib';

type ImageBlockProps = {
  image: string;
  by: string;
} & BlockProps;

export const ImageBlock: FC<ImageBlockProps> = (props: ImageBlockProps) => {
  const { image, by, ...rest } = props;

  return (
    <Block variant="overlay" width={rest.width || 'inherit'} {...rest}>
      <FragmentImage src={image} draggable={false} />
      <Text.Hint className="block-author" noSelection fontSize={0}>
        {by}
      </Text.Hint>
    </Block>
  );
};
