import { Urbit } from '../urbit/api';

export const quickPoke = async (
  ship: string,
  data: { app: string; mark: string; json: any },
  credentials: { url: string; cookie: string },
  response?: { path?: string }
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
        const response = await conduit.poke(data);
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
