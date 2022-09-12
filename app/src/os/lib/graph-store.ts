import { patp } from 'urbit-ob';

export const pathToDmInbox = (path: string) => {
  if (path.includes('dm-inbox')) {
    const pathArr = path.split('/').splice(3);
    return `/dm-inbox/${patp(pathArr[1])}`;
  } else {
    const pathArr = path.split('/').splice(2);
    const graphPath = `/${pathArr.join('/')}`;
    return graphPath;
  }
};

// export const pathToDmInbox = (path: string) => {
//   const pathArr = path.split('/').splice(3);
//   return `/dm-inbox/${patp(pathArr[1])}`;
// };
