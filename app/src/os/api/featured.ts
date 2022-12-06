import { Conduit } from "@holium/conduit";

export const FeaturedApi = {
  getFeatured: async (conduit: Conduit) => {
    return await conduit.scry({
      app: 'featured',
      path: '/spaces',
    })
  }
};
