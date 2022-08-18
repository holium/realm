import { Urbit } from './../urbit/api';
// import { cleanNounColor } from '../lib/color';

export const GroupsApi = {
  /**
   * getOur: returns a map of groups you host
   *
   * @param conduit the conduit instance
   * @returns Promise<{ [path: GroupPath]: GroupSpace }>
   */
  getOur: async (conduit: Urbit): Promise<{ [path: string]: any }> => {
    const response = await conduit.scry({
      app: 'spaces',
      path: '/groups', // the spaces scry is at the root of the path
    });
    // console.log(response);
    // return response.groups;
    return Array.from(Object.values(response.groups));
  },
};
