import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../general/Flex/Flex';
import { Text } from '../../general/Text/Text';
import { AppGroup } from './AppGroup';
import { Notification } from './Notification';

export default {
  component: Notification,
} as ComponentMeta<typeof Notification>;
const containerWidth = 400;

export const Base: ComponentStory<typeof Notification> = () => (
  <>
    <Flex flexDirection="column" px={3} mt={3} gap={4} width={containerWidth}>
      <Text.Custom fontSize={1} opacity={0.5}>
        no image
      </Text.Custom>
      <Notification
        containerWidth={containerWidth}
        notification={{
          id: 1,
          app: 'realm-chat',
          path: '/realm-chat/new-messages',
          title: 'New Message',
          content: 'You have a new message from ~zod',
          type: 'message',
          read: true,
          readAt: null,
          dismissed: false,
          dismissedAt: null,
          createdAt: 1679433073,
          updatedAt: new Date().getTime(),
        }}
        onDismiss={() => console.log('dismissed')}
        onLinkClick={(app, path, link) =>
          console.log(`clicked - ${app} ${path} ${link}`)
        }
      />
    </Flex>
    <Flex flexDirection="column" px={3} mt={3} gap={4} width={containerWidth}>
      <Text.Custom fontSize={1} opacity={0.5}>
        w/ image
      </Text.Custom>
      <Notification
        containerWidth={containerWidth}
        notification={{
          id: 1,
          app: 'engram',
          path: '/engram/document/0/new-comment',
          image:
            'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/engram.svg',
          title: 'New comment on your document',
          content: 'I think you should change this line to say "goodbye world"',
          type: 'message',
          read: true,
          readAt: null,
          dismissed: false,
          dismissedAt: null,
          createdAt: 1679347373,
          updatedAt: new Date().getTime(),
        }}
        onDismiss={() => console.log('dismissed')}
        onLinkClick={(app, path, link) =>
          console.log(`clicked - ${app} ${path} ${link}`)
        }
      />
    </Flex>
    <Flex flexDirection="column" px={3} mt={3} gap={4} width={containerWidth}>
      <Text.Custom fontSize={1} opacity={0.5}>
        w/ app
      </Text.Custom>
      <Notification
        appInfo={{
          image:
            'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/engram.svg',
          name: 'Engram',
          key: 'engram',
        }}
        containerWidth={containerWidth}
        notification={{
          id: 1,
          app: 'engram',
          path: '/engram/document/0/new-comment',
          title: 'New comment on your document',
          content: 'I think you should change this line to say "goodbye world"',
          type: 'message',
          read: true,
          readAt: null,
          dismissed: false,
          dismissedAt: null,
          createdAt: 1679347373,
          updatedAt: new Date().getTime(),
        }}
        onDismiss={() => console.log('dismissed')}
        onLinkClick={(app, path, link) =>
          console.log(`clicked - ${app} ${path} ${link}`)
        }
      />
    </Flex>
    <Flex flexDirection="column" px={3} mt={3} gap={4} width={containerWidth}>
      <Text.Custom fontSize={1} opacity={0.5}>
        w/ app & buttons
      </Text.Custom>
      <Notification
        appInfo={{
          image:
            'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/engram.svg',
          name: 'Engram',
          key: 'engram',
        }}
        containerWidth={containerWidth}
        notification={{
          id: 1,
          app: 'engram',
          path: '/engram/document/0/new-comment',
          title: 'New comment on your document',
          content: 'I think you should change this line to say "goodbye world"',
          type: 'message',
          read: true,
          readAt: null,
          buttons: [
            {
              label: 'Approve',
              path: '/engram/document/0/approve-comment',
              data: JSON.stringify({ commentId: 1 }),
            },
            {
              label: 'Reject',
              path: '/engram/document/0/reject-comment',
              data: JSON.stringify({ commentId: 1 }),
            },
          ],
          dismissed: false,
          dismissedAt: null,
          createdAt: 1679347373,
          updatedAt: new Date().getTime(),
        }}
        onDismiss={() => console.log('dismissed')}
        onLinkClick={(app, path, link) =>
          console.log(`clicked - ${app} ${path} ${link}`)
        }
      />
    </Flex>
    <Flex flexDirection="column" px={3} mt={3} gap={4} width={containerWidth}>
      <Text.Custom fontSize={1} opacity={0.5}>
        link click
      </Text.Custom>
      <Notification
        containerWidth={containerWidth}
        notification={{
          id: 1,
          app: 'engram',
          path: '/engram/document/0/new-comment',
          title: 'New web link',
          content: 'A twitter link',
          type: 'link',
          read: true,
          readAt: null,
          link: 'https://twitter.com/TheCombineDAO/status/1638269197435260943',
          dismissed: false,
          dismissedAt: null,
          createdAt: 1679347373,
          updatedAt: new Date().getTime(),
        }}
        onDismiss={() => console.log('dismissed')}
        onLinkClick={(app, path, link) =>
          console.log(`clicked - ${app} ${path} ${link}`)
        }
      />
    </Flex>
  </>
);

export const GroupedByApp: ComponentStory<typeof AppGroup> = () => {
  const chatModel: any = {
    '/realm-chat/0': {
      id: 0,
      title: 'Based chat',
      description: 'A chat for based people',
      members: ['~zod', '~nus', '~tasfyn'],
      image:
        'https://www.memeatlas.com/images/pepes/pepe-bit-art-face-profile-picture.png',
    },
    '/realm-chat/1': {
      id: 0,
      title: 'Holium chat',
      description: 'A chat for based people',
      members: ['~zod', '~nus', '~tasfyn'],
      image:
        'https://pbs.twimg.com/profile_images/1621630320796745729/H5wKemm1_400x400.jpg',
    },
  };

  return (
    <>
      <Flex flexDirection="column" px={3} mt={3} gap={4} width={containerWidth}>
        <Text.Custom fontSize={1} opacity={0.5}>
          No path grouping
        </Text.Custom>
        <AppGroup
          appInfo={{
            image: 'https://cdn-icons-png.flaticon.com/512/724/724715.png',
            name: 'Realm Chat',
            key: 'realm-chat',
          }}
          onDismiss={(id) => console.log(`dismissed - ${id}`)}
          onDismissAll={(app, path) =>
            console.log(`dismissed all ${app} ${path}`)
          }
          onLinkClick={(app, path, link) =>
            console.log(`clicked - ${app} ${path} ${link}`)
          }
          onPathLookup={(app, path) => {
            console.log(`path lookup - ${app} ${path}`);
            return chatModel[path];
          }}
          containerWidth={containerWidth}
          notifications={[
            {
              id: 1,
              app: 'realm-chat',
              path: '/realm-chat/0',
              title: 'Based chat',
              content: 'DrunkPlato - Where’s the flamethrower?',
              type: 'message',
              read: true,
              readAt: null,
              dismissed: false,
              dismissedAt: null,
              metadata: JSON.stringify(chatModel['/realm-chat/0']),
              createdAt: 1679433073,
              updatedAt: new Date().getTime(),
            },
            {
              id: 1,
              app: 'realm-chat',
              path: '/realm-chat/0',
              title: 'Based chat',
              content: 'dimwit-codder - What do you think of my code?',
              type: 'message',
              read: true,
              readAt: null,
              dismissed: false,
              metadata: JSON.stringify(chatModel['/realm-chat/0']),
              dismissedAt: null,
              createdAt: 1679423073,
              updatedAt: new Date().getTime(),
            },
            {
              id: 1,
              app: 'realm-chat',
              path: '/realm-chat/1',
              title: 'Holium chat',
              content: 'AidenSolaran - Looking at your PR.',
              type: 'message',
              read: true,
              readAt: null,
              dismissed: false,
              metadata: JSON.stringify(chatModel['/realm-chat/1']),
              dismissedAt: null,
              createdAt: 1679333073,
              updatedAt: new Date().getTime(),
            },
          ]}
        />
      </Flex>
      <Flex flexDirection="column" px={3} mt={3} gap={4} width={containerWidth}>
        <Text.Custom fontSize={1} opacity={0.5}>
          With path grouping
        </Text.Custom>
        <AppGroup
          appInfo={{
            image: 'https://cdn-icons-png.flaticon.com/512/724/724715.png',
            name: 'Realm Chat',
            key: 'realm-chat',
          }}
          groupByPath
          onDismiss={(id) => console.log(`dismissed - ${id}`)}
          onDismissAll={(app, path) =>
            console.log(`dismissed all ${app} ${path}`)
          }
          onPathLookup={(app, path) => {
            console.log(`path lookup - ${app} ${path}`);
            return chatModel[path];
          }}
          onLinkClick={(app, path, link) =>
            console.log(`clicked - ${app} ${path} ${link}`)
          }
          containerWidth={containerWidth}
          notifications={[
            {
              id: 1,
              app: 'realm-chat',
              path: '/realm-chat/0',
              title: 'DrunkPlato',
              content: 'Where’s the flamethrower?',
              type: 'message',
              read: true,
              readAt: null,
              dismissed: false,
              dismissedAt: null,
              pathMetadata: JSON.stringify(chatModel['/realm-chat/0']),
              createdAt: 1679433073,
              updatedAt: new Date().getTime(),
            },
            {
              id: 1,
              app: 'realm-chat',
              path: '/realm-chat/0',
              title: 'dimwit-codder',
              content: 'What do you think of my code?',
              type: 'message',
              read: true,
              readAt: null,
              dismissed: false,
              pathMetadata: JSON.stringify(chatModel['/realm-chat/0']),
              dismissedAt: null,
              createdAt: 1679423073,
              updatedAt: new Date().getTime(),
            },
            {
              id: 1,
              app: 'realm-chat',
              path: '/realm-chat/1',
              title: 'AidenSolaran',
              content: 'Looking at your PR.',
              type: 'message',
              read: true,
              readAt: null,
              dismissed: false,
              pathMetadata: JSON.stringify(chatModel['/realm-chat/1']),
              dismissedAt: null,
              createdAt: 1679333073,
              updatedAt: new Date().getTime(),
            },
          ]}
        />
      </Flex>
    </>
  );
};

export const GroupedByPath: ComponentStory<typeof AppGroup> = () => {
  const chatModel: any = {
    '/realm-chat/0': {
      id: 0,
      title: 'Based chat',
      description: 'A chat for based people',
      members: ['~zod', '~nus', '~tasfyn'],
      image:
        'https://www.memeatlas.com/images/pepes/pepe-bit-art-face-profile-picture.png',
    },
    '/realm-chat/1': {
      id: 0,
      title: 'Holium chat',
      description: 'A chat for based people',
      members: ['~zod', '~nus', '~tasfyn'],
      image:
        'https://pbs.twimg.com/profile_images/1621630320796745729/H5wKemm1_400x400.jpg',
    },
  };

  return (
    <>
      <Flex
        flexDirection="column"
        px={3}
        mt={3}
        gap={4}
        height={700}
        width={containerWidth}
      >
        <AppGroup
          appInfo={{
            image: 'https://cdn-icons-png.flaticon.com/512/724/724715.png',
            name: 'Realm Chat',
            key: 'realm-chat',
          }}
          onPathLookup={(app, path) => {
            console.log(`path lookup - ${app} ${path}`);
            return chatModel[path];
          }}
          groupByPath
          onDismiss={(id) => console.log(`dismissed - ${id}`)}
          onDismissAll={(app, path) =>
            console.log(`dismissed all ${app} ${path}`)
          }
          onLinkClick={(app, path, link) =>
            console.log(`clicked - ${app} ${path} ${link}`)
          }
          containerWidth={containerWidth}
          notifications={[
            {
              id: 1,
              app: 'realm-chat',
              path: '/realm-chat/0',
              title: 'DrunkPlato',
              content: 'Where’s the flamethrower?',
              type: 'message',
              read: true,
              readAt: null,
              dismissed: false,
              dismissedAt: null,
              pathMetadata: JSON.stringify(chatModel['/realm-chat/0']),
              createdAt: 1679433073,
              updatedAt: new Date().getTime(),
            },
            {
              id: 1,
              app: 'realm-chat',
              path: '/realm-chat/0',
              title: 'dimwit-codder',
              content: 'What do you think of my code?',
              type: 'message',
              read: true,
              readAt: null,
              dismissed: false,
              pathMetadata: JSON.stringify(chatModel['/realm-chat/0']),
              dismissedAt: null,
              createdAt: 1679423073,
              updatedAt: new Date().getTime(),
            },
            {
              id: 1,
              app: 'realm-chat',
              path: '/realm-chat/1',
              title: 'AidenSolaran',
              content: 'Looking at your PR.',
              type: 'message',
              read: true,
              readAt: null,
              dismissed: false,
              pathMetadata: JSON.stringify(chatModel['/realm-chat/1']),
              dismissedAt: null,
              createdAt: 1679333073,
              updatedAt: new Date().getTime(),
            },
          ]}
        />
      </Flex>
    </>
  );
};
