import { Urbit } from '../urbit/api';

export const quickPoke = async (
  ship: string,
  data: { app: string; mark: string; json: any },
  credentials: { url: string; cookie: string },
  response?: { path?: string; mark?: string; op?: 'add' | 'replace' | 'remove' }
) => {
  const { url, cookie } = credentials;
  let path: string | undefined = undefined;
  if (response) {
    path = response.path;
  }
  const conduit = new Urbit(url, ship, cookie);
  conduit.open();
  const res1 = await new Promise(async (resolve, reject) => {
    try {
      conduit.on('ready', async () => {
        if (path) {
          const messageId = await conduit.subscribe({
            app: data.app,
            path: path!,
            event: async (data: any) => {
              switch (data['spaces-reaction']) {
                case 'initial':
                  // console.log(data['spaces-reaction']);
                  break;
                case 'add':
                  console.log(data['spaces-reaction']['add']);
                  break;
                case 'replace':
                  console.log(data['spaces-reaction']['replace']);
                  break;
                case 'remove':
                  break;
                default:
                  // unknown
                  break;
              }
            },
            err: () => console.log('Subscription rejected'),
            quit: () => console.log('Kicked from subscription'),
          });
          data.json.id = messageId;
        }
        console.log(data);
        const response = await conduit.poke(data);
        if (!path) {
          resolve(response);
        }
        if (path) {
          resolve(await conduit.subscribeOnce(data.app, path));
        } else {
          resolve(response);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
  conduit.delete();
  console.log(res1);
  return res1;
};
