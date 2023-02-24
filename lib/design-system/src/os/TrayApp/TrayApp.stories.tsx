import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { motion } from 'framer-motion';
import { Button, Flex, Text, Icon, Row } from '../../';
import { TrayApp } from './TrayApp';

export default {
  component: TrayApp,
} as ComponentMeta<typeof TrayApp>;

export const Default: ComponentStory<typeof TrayApp> = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Flex
      position="relative"
      height={700}
      width={500}
      style={{
        objectFit: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage:
          'url(https://images.unsplash.com/photo-1673447042805-7a3b1096f3a7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=4032&q=80)',
        borderRadius: '6px',
        flexDirection: 'column',
      }}
    >
      <TrayApp
        id="spaces"
        isOpen={isOpen}
        coords={{
          x: (500 - 350) / 2,
          y: 700 - 500 - 40,
          width: 350,
          height: 500,
        }}
        closeTray={() => {
          setIsOpen(false);
        }}
      >
        <Flex flexDirection="column">
          <Flex
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Text.Custom
              fontWeight={600}
              textTransform="uppercase"
              pl={1}
              opacity={0.7}
            >
              Spaces
            </Text.Custom>
            <Flex flexDirection="row" gap={8}>
              <Button.IconButton width={26} height={26}>
                <Icon name="Search" size={20} opacity={0.7} />
              </Button.IconButton>
              <Button.IconButton width={26} height={26}>
                <Icon name="Plus" size={24} opacity={0.7} />
              </Button.IconButton>
            </Flex>
          </Flex>
          <Row>
            <Flex gap={8} alignItems="center">
              <motion.img
                style={{ borderRadius: 6 }}
                height="32px"
                width="32px"
                src="https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/93/93e94fa67d7c5481f6c07c08c5fbef2ec9695684_full.jpg"
              />
              <Flex flexDirection="column">
                <Text.Custom fontWeight={500} fontSize={2}>
                  Minecraft Land
                </Text.Custom>
                <Flex alignItems="center" gap={4}>
                  <Icon name="Members" size={14} opacity={0.7} />
                  <Text.Custom opacity={0.6}>12 members</Text.Custom>
                </Flex>
              </Flex>
            </Flex>
          </Row>
        </Flex>
      </TrayApp>
      <Button.Primary
        id="spaces-icon"
        width={80}
        position="absolute"
        bottom={12}
        left="calc(50% - 40px)"
        onClick={(evt) => {
          evt.stopPropagation();
          if (isOpen) {
            setIsOpen(false);
          } else {
            setIsOpen(true);
          }
        }}
      >
        Open App
      </Button.Primary>
    </Flex>
  );
};
