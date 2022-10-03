import { Conduit } from '@holium/conduit';

export const GroupsApi = {
  /**
   * getOur: returns a map of groups you host
   *
   * @param conduit the conduit instance
   * @returns Promise<{ [path: GroupPath]: GroupSpace }>
   */
  getOur: async (conduit: Conduit): Promise<{ [path: string]: any }> => {
    const response = await conduit.scry({
      app: 'spaces',
      path: '/groups', // the spaces scry is at the root of the path
    });
    // console.log(response);
    // return response.groups;
    return Array.from(Object.values(response.groups));
  },
  getMembers: async (
    conduit: Conduit,
    path: string
  ): Promise<{ [path: string]: any }> => {
    const response = await conduit.scry({
      app: 'spaces',
      path: `/groups/${path}/members`, // the spaces scry is at the root of the path
    });
    console.log(response);
    return response;
    // return Array.from(Object.values(response.groups));
  },
};
