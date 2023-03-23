import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../general/Flex/Flex';
import { NotificationList } from './NotificationList';

export default {
  component: NotificationList,
} as ComponentMeta<typeof NotificationList>;
const containerWidth = 400;

export const ListGroupedByApp: ComponentStory<typeof NotificationList> = () => {
  const chatModel: any = {
    'realm-chat': {
      image: 'https://cdn-icons-png.flaticon.com/512/724/724715.png',
      name: 'Realm Chat',
      key: 'realm-chat',
    },
    engram: {
      image:
        'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/engram.svg',
      name: 'Engram',
      key: 'engram',
    },
  };

  return (
    <>
      <Flex flexDirection="column" px={3} mt={3} gap={4} width={containerWidth}>
        <NotificationList
          containerWidth={containerWidth}
          appLookup={(app) => {
            return chatModel[app];
          }}
          onLinkClick={(app, path, link) =>
            console.log(`clicked - ${app} ${path} ${link}`)
          }
          onDismiss={(app, path, id) =>
            console.log(`dismissed - ${app} ${path} ${id}`)
          }
          onDismissAll={(app, path) =>
            console.log(`dismissed all ${app} ${path || ''}`)
          }
          notifications={[
            {
              id: 0,
              app: 'engram',
              path: '/engram/document/0/new-comment',
              title: 'New document created',
              content: '~fasnut-famden created "Tax Notes - 3/22/23"',
              type: 'message',
              link: 'realm://apps/engram/document/2',
              read: true,
              readAt: null,
              dismissed: false,
              dismissedAt: null,
              createdAt: 1679347373,
              updatedAt: new Date().getTime(),
            },
            {
              id: 1,
              app: 'engram',
              path: '/engram/document/0/new-comment',
              title: 'New comment on your document',
              content:
                'I think you should change this line to say "goodbye world"',
              type: 'message',
              link: 'realm://apps/engram/document/0/comment/1',
              read: true,
              readAt: null,
              dismissed: false,
              dismissedAt: null,
              createdAt: 1679347373,
              updatedAt: new Date().getTime(),
            },
            {
              id: 2,
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
              id: 3,
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
              id: 4,
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
    </>
  );
};
