import { LinkBlockType } from './LinkBlock';
import { parseMediaType } from '../../util/links';

export const OPENGRAPH_API = 'https://api.holium.live/v1/opengraph/opengraph';
export const RAW_LINK_HEIGHT = '2.75rem';
export const LINK_PREVIEW_HEIGHT = '15rem';

export type OpenGraphType = {
  twitterCard: string; // 'summary_large_image'
  twitterSite: string; // '@verge';
  ogSiteName: string; //'The Verge';
  ogTitle: string; //'Spotify is laying off 6 percent of its global workforce, CEO announces';
  ogDescription: string; // 'Impacting almost 600 employees.';
  ogUrl: string; //'https://www.theverge.com/2023/1/23/23567333/spotify-layoffs-daniel-ek-cost-cutting';
  ogType: string; //'article';
  articlePublishedTime: string; //'2023-01-23T12:30:00.726Z';
  articleModifiedTime: string; //'2023-01-23T12:30:00.726Z';
  author: string; //'Jon Porter';
  ogImage: {
    url: string; //'https://cdn.vox-cdn.com/thumbor/TN-dCJzSsrzVGl4x4SgbBQJ1ajU=/0x0:2040x1360/1200x628/filters:focal(1020x680:1021x681)/cdn.vox-cdn.com/uploads/chorus_asset/file/23951394/STK088_VRG_Illo_N_Barclay_1_spotify.jpg';
    width: number | null;
    height: number | null;
    type: string | null;
  };
  requestUrl: string; //'https://www.theverge.com/2023/1/23/23567333/spotify-layoffs-daniel-ek-cost-cutting';
  success: boolean; // true
};

export type LinkPreviewType = {
  ogDescription: string;
  ogImage: string;
  ogSiteName: string;
  ogTitle: string;
  ogType: string;
  ogUrl: string;
  author: string;
};

export const extractOGData = (data: OpenGraphType): LinkPreviewType => {
  return {
    ogDescription: data.ogDescription || '',
    ogImage: data.ogImage?.url || '',
    ogSiteName: data.ogSiteName || '',
    ogTitle: data.ogTitle || '',
    ogType: data.ogType || '',
    ogUrl: data.ogUrl || '',
    author: data.author || '',
  };
};
export const fetchOGData = async (
  link: string
): Promise<{ linkType: LinkBlockType; data: any }> => {
  return new Promise((resolve, reject) => {
    const { linkType } = parseMediaType(link);
    if (linkType !== 'link') {
      resolve({ linkType, data: null });
    }

    fetch(`${OPENGRAPH_API}?url=${encodeURIComponent(link)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (res.status === 200) {
          const data = await res.json();
          if (!data || data.error) {
            resolve({ linkType: 'url', data: null });
          } else {
            resolve({ linkType: 'opengraph', data });
          }
        } else {
          resolve({ linkType: 'url', data: null });
        }
      })
      .catch((err) => {
        console.error(err);
        reject({ linkType: 'url', data: null });
      });
  });
};
