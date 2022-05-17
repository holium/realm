import { hexToUx } from '../../lib/color';
import { cleanNounColor } from '../../../renderer/logic/utils/color';
import { Urbit } from '../../urbit/api';

export const ContactApi = {
  getContact: async (
    ship: string,
    credentials: { url: string; cookie: string }
  ) => {
    const { url, cookie } = credentials;
    try {
      const conduit = new Urbit(url, ship, cookie);
      // conduit.open();
      // conduit.on('ready', () => {
      //   console.log('after open');
      // });

      const response = await conduit.scry({
        app: 'contact-store',
        path: `/contact/${ship}`,
      });
      conduit.delete();

      const contact = response['contact-update']?.add.contact;
      // color: newContact.color && cleanNounColor(newContact.color),
      return {
        ...contact,
        color: contact.color && cleanNounColor(contact.color),
      };
    } catch (err: any) {
      console.log(err);
      throw err;
    }
  },
  saveContact: async (
    ship: string,
    credentials: { url: string; cookie: string },
    data: any
  ) => {
    const { url, cookie } = credentials;
    const preparedData: any = {
      nickname: data.nickname,
      color: hexToUx(data.color),
      avatar: data.avatar || '',
    };
    console.log(preparedData, data.color);
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
    console.log(res1, res2);
    conduit.delete();

    // console.log({
    //   ['edit']: {
    //     ship,
    //     'edit-field': {
    //       color: preparedData.color,
    //     },
    //     timestamp: Date.now(),
    //   },
    // });

    // return new Promise(async (resolve, reject) => {
    //   try {
    //     conduit.on('ready', async () => {
    //       const response = await conduit.poke({
    //         app: 'contact-store',
    //         mark: 'contact-update-0',
    //         json: {
    //           ['edit']: {
    //             ship,
    //             'edit-field': {
    //               nickname: preparedData.nickname,
    //               // ['color']: preparedData.color,
    //             },
    //             timestamp: Date.now(),
    //           },
    //         },
    //       });
    //       // console.log(response)
    //       conduit.delete();
    //       resolve(response);
    //     });
    //   } catch (err) {
    //     console.log('eerror');
    //     reject(err);
    //   }
    // });

    // console.log(res);

    // console.log('poking ship', ship, data);
    // try {
    //   const response = await Conduit.quickPoke(
    //     ship,
    //     credentials.url,
    //     credentials.cookie,
    //     'contact-store',
    //     'contact-update-0',
    //     '/updates',
    //     data
    //   );
    //   return response;
    // } catch (err: any) {
    //   throw err;
    // }
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
