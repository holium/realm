import { ISession } from '../';
import { Urbit } from '../urbit/api';
import { cleanNounColor, removeHash } from '../lib/color';

export const ContactApi = {
  getContact: async (ship: string, credentials: ISession) => {
    const { url, cookie } = credentials;
    try {
      const conduit = new Urbit(url, ship, cookie);

      const response = await conduit.scry({
        app: 'contact-store',
        path: `/contact/${ship}`,
      });
      conduit.delete();

      const contact = response['contact-update']?.add.contact;

      return {
        ...contact,
        color: contact.color && cleanNounColor(contact.color),
      };
    } catch (err: any) {
      console.log(err);
      throw err;
    }
  },
  saveContact: async (ship: string, credentials: ISession, data: any) => {
    const { url, cookie } = credentials;
    const preparedData: any = {
      nickname: data.nickname,
      color: removeHash(data.color),
      avatar: data.avatar || '',
    };
    const conduit = new Urbit(url, ship, cookie);
    conduit.open();
    const editJson = Object.keys(preparedData).map((updateKey: string) => ({
      key: updateKey,
      data: preparedData[updateKey],
    }));
    const [res1, res2, res3] = await Promise.all(
      editJson.map(
        (edit: any) =>
          new Promise(async (resolve, reject) => {
            try {
              conduit.on('ready', async () => {
                const response = await conduit.poke({
                  app: 'contact-store',
                  mark: 'contact-update-0',
                  json: {
                    ['edit']: {
                      ship,
                      'edit-field': {
                        [edit.key]: edit.data,
                      },
                      timestamp: Date.now(),
                    },
                  },
                });
                console.log(response);
                resolve(response);
              });
            } catch (err) {
              reject(err);
            }
          })
      )
    );
    conduit.delete();
    return {
      nickname: preparedData.nickname,
      color: `#${preparedData.color}`,
      avatar: preparedData.avatar,
    };
  },
};

// const response = await Conduit.pokeOnce(
//   ship,
//   credentials.url,
//   credentials.cookie,
//   'contact-store',
//   'contact-update-0',
//   `/updates/our`,
// Object.keys(data).map((updateKey: string) => ({
//   edit: {
//     ship,
//     'edit-field': {
//       [updateKey]: data[updateKey],
//     },
//     timestamp: Date.now(),
//   },
// }))
// );
