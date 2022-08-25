import { Conduit } from '@holium/conduit';
import { cleanNounColor, removeHash } from '../lib/color';

export const ContactApi = {
  getContact: async (conduit: Conduit, ship: string) => {
    try {
      const response = await conduit.scry({
        app: 'contact-store',
        path: `/contact/${ship}`,
      });

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
  saveContact: async (conduit: Conduit, ship: string, data: any) => {
    const preparedData: any = {
      nickname: data.nickname,
      color: removeHash(data.color),
      avatar: data.avatar || '',
    };
    const editJson = Object.keys(preparedData).map((updateKey: string) => ({
      key: updateKey,
      data: preparedData[updateKey],
    }));
    const [res1, res2, res3] = await Promise.all(
      editJson.map(
        (edit: any) =>
          new Promise(async (resolve, reject) => {
            try {
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
              resolve(response);
            } catch (err) {
              reject(err);
            }
          })
      )
    );
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
