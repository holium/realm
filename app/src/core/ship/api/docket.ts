import { cleanNounColor } from '../../../renderer/logic/utils/color';
import { Conduit } from '../../conduit';

export const DocketApi = {
  getShipApps: async (
    ship: string,
    credentials: { url: string; cookie: string }
  ) => {
    try {
      const response = await Conduit.scryFetch(
        credentials.url,
        credentials.cookie,
        'docket',
        `/charges`
      );
      const apps = response.json?.data['charge-update']?.initial;
      console.log(apps);
      Object.values(apps).map((app: any) => {
        return {
          ...app,
          color: app.color && cleanNounColor(app.color),
        };
      });
      return apps;
    } catch (err: any) {
      console.log(err);
    }
  },
  // saveContact: async (
  //   ship: string,
  //   credentials: { url: string; cookie: string },
  //   data: any
  // ) => {
  //   console.log('poking ship', ship, data);
  // },
};
