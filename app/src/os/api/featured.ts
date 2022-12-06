import { Conduit } from "@holium/conduit";

export const FeaturedApi = {
  getFeaturedSpaces: async (conduit: Conduit) => {
    return await conduit.scry({
      app: 'featured',
      path: '/spaces',
    })
  }
};
