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
  getGroup: async (
    conduit: Conduit,
    path: string
  ): Promise<{ [path: string]: any }> => {
    const response = await conduit.scry({
      app: 'spaces',
      path: `/groups${path}`, // the spaces scry is at the root of the path
    });
    return response;
    // return Array.from(Object.values(response.groups));
  },
  getGroupMembers: async (
    conduit: Conduit,
    path: string
  ): Promise<{ [path: string]: any }> => {
    return (await conduit.scry({
      app: 'spaces',
      path: `/groups${path}/members`, // the spaces scry is at the root of the path
    })).members;
    // return Array.from(Object.values(response.groups));
  },
};
