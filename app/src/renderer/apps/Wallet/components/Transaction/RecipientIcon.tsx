import { Avatar, Box, Icon } from '@holium/design-system/general';

type Props = {
  recipientMetadata?: {
    color: string;
    avatar?: string;
  };
  valueCache: string;
  icon: string;
};

export const RecipientIcon = ({
  recipientMetadata,
  valueCache,
  icon,
}: Props) => {
  if (recipientMetadata) {
    return (
      <Avatar
        sigilColor={[recipientMetadata.color, 'white']}
        avatar={recipientMetadata.avatar}
        simple={true}
        size={24}
        patp={valueCache}
      />
    );
  }

  if (icon === 'spy') return <Icon name="Spy" size="24px" />;

  if (icon === 'sigil')
    return (
      <Avatar
        simple={true}
        size={24}
        patp={valueCache}
        sigilColor={['#000000', 'white']}
      />
    );

  return <Box height="24px" width="24px" borderRadius="5px" />;
};
