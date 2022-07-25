import { Urbit } from '../urbit/api';

type EffectKeyType = 'add' | 'replace' | 'remove' | string;

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
        let messageId;
        if (path) {
          messageId = await conduit.subscribe({
            app: data.app,
            path: path!,
            event: (data: any) => {
              const effectType: EffectKeyType = Object.keys(
                data['spaces-reaction']
              )[0];
              if (effectType === response!.op) {
                resolve(data);
              }
              // switch (effectType) {
              //   case 'add':
              //     console.log(data['spaces-reaction']['add']);
              //     break;
              //   case 'replace':
              //     console.log('in response', data);
              //     console.log(data['spaces-reaction']['replace']);
              //     break;
              //   case 'remove':
              //     break;
              // }
            },
            err: () => console.log('Subscription rejected'),
            quit: () => console.log('Kicked from subscription'),
          });
        }
        messageId = await conduit.poke(data);
        if (!path) {
          resolve(messageId);
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
