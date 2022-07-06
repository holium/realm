import { motion } from 'framer-motion';
import React, { forwardRef } from 'react';
import styled from 'styled-components';
import {
  compose,
  space,
  color,
  layout,
  width,
  height,
  typography,
  WidthProps,
  HeightProps,
  SpaceProps,
  ColorProps,
  LayoutProps,
  TypographyProps,
} from 'styled-system';

export type IconProps = SpaceProps &
  ColorProps &
  LayoutProps &
  TypographyProps &
  WidthProps &
  HeightProps;

const SvgComponent = forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement> & {
    title?: string;
  }
>(({ title, name, ...props }, svgRef) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={props.width || '1em'}
      height={props.height || '1em'}
      fill="currentcolor"
      className="item"
    >
      <motion.circle
        cx="12px"
        cy="12px"
        r="11px"
        rotate="90%"
        fill="none"
        strokeWidth="1.5px"
        transition={{
          initial: { delay: 0.1, duration: 1, stroke: { duration: 0.5 } },
        }}
        initial={{ stroke: props.fill, pathLength: 0, opacity: 0.9 }}
        animate={{ stroke: props.fill, pathLength: 1.1 }}
      />
      <motion.path
        initial={{
          fill: props.fill,
          opacity: 0,
        }}
        animate={{ fill: props.fill, opacity: 0.9 }}
        transition={{ initial: { delay: 1.2, opacity: 2, ease: 'easeInOut' } }}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.7747 3.02161C14.8164 3.19673 16.8097 4.06548 18.3721 5.62788C19.9345 7.19028 20.8033 9.18365 20.9784 11.2253H15.2389C13.8779 11.2253 12.7747 10.1221 12.7747 8.76116V3.02161ZM21 12.4574C20.8913 14.6089 20.0154 16.7289 18.3721 18.3721C16.8097 19.9345 14.8164 20.8033 12.7747 20.9784V14.9216C12.7747 13.5607 13.8779 12.4574 15.2389 12.4574H21ZM11.5426 21C9.39111 20.8913 7.27113 20.0154 5.62788 18.3721C3.98464 16.7289 3.10868 14.6089 3.00001 12.4574H9.07844C10.4394 12.4574 11.5426 13.5607 11.5426 14.9216V21ZM3.02162 11.2253C3.19672 9.18365 4.06548 7.19028 5.62788 5.62788C7.27113 3.98463 9.39111 3.10867 11.5426 3V8.76116C11.5426 10.1221 10.4394 11.2253 9.07844 11.2253H3.02162Z"
      />
    </motion.svg>
  );
});

export const HoliumAnimated = styled(SvgComponent)<IconProps>`
  flex: none;
  vertical-align: middle;
  ${compose(space, color, width, height, layout, typography)}
`;

export default HoliumAnimated;

export const SplashWordMark = (animateProps: any) => {
  return (
    <motion.svg
      width="111"
      height="19"
      viewBox="0 0 111 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...animateProps}
    >
      <motion.path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M60.9336 1V18.4706H57.6094V1H60.9336ZM74.4582 18.4706C76.4052 18.4706 77.8699 18.0047 78.8523 17.0729C79.8347 16.1412 80.3259 14.7522 80.3259 12.9059V1H77.2179V12.6729C77.2179 13.5529 76.9768 14.2302 76.4945 14.7047C76.0122 15.1792 75.262 15.4165 74.2439 15.4165H71.0287C69.9749 15.4165 69.2112 15.1792 68.7379 14.7047C68.2646 14.2302 68.0279 13.5529 68.0279 12.6729V1H64.8127V12.9059C64.8127 16.6157 66.7597 18.4706 70.6536 18.4706H74.4582ZM96.8678 19C98.0965 19 99.036 18.7124 99.6865 18.1373C100.337 17.5622 100.843 16.7768 101.204 15.7811L105.649 4.6824C105.739 4.45923 105.87 4.27897 106.042 4.14163C106.214 4.00429 106.417 3.93562 106.652 3.93562C106.923 3.93562 107.144 4.02575 107.316 4.20601C107.488 4.38627 107.573 4.6309 107.573 4.93991V18.691H110.799V4.78541C110.799 3.65236 110.46 2.7382 109.782 2.04292C109.105 1.34764 108.088 1 106.733 1C105.505 1 104.57 1.28755 103.928 1.86266C103.287 2.43777 102.785 3.22318 102.424 4.21888L97.979 15.3176C97.7984 15.7983 97.455 16.0386 96.9491 16.0386C96.6781 16.0386 96.4568 15.9485 96.2851 15.7682C96.1135 15.588 96.0276 15.3519 96.0276 15.0601V4.78541C96.0276 3.65236 95.6889 2.7382 95.0113 2.04292C94.3337 1.34764 93.3174 1 91.9622 1C90.7336 1 89.7985 1.28755 89.1571 1.86266C88.5156 2.43777 88.0142 3.22318 87.6529 4.21888L81.9884 18.691H85.4033L90.8781 4.6824C90.9684 4.45923 91.0949 4.27897 91.2575 4.14163C91.4202 4.00429 91.6279 3.93562 91.8809 3.93562C92.1519 3.93562 92.3778 4.02575 92.5585 4.20601C92.7392 4.38627 92.8295 4.6309 92.8295 4.93991V15.1888C92.8295 16.3391 93.1638 17.2618 93.8323 17.9571C94.5008 18.6524 95.5127 19 96.8678 19Z"
        fill="#E2E7EA"
      />
      <motion.path
        d="M53.9301 17.9077V15.0162H47.237C46.5558 15.0162 45.9895 14.9427 45.5382 14.7957C45.0869 14.6486 44.725 14.4485 44.4525 14.1953C44.18 13.9421 43.9884 13.6399 43.8777 13.2886C43.767 12.9374 43.7117 12.5657 43.7117 12.1737V12.1737V1.36719H40.6973V12.1982C40.6973 13.0313 40.8122 13.7951 41.0421 14.4893C41.2721 15.1836 41.6425 15.784 42.1534 16.2904C42.6643 16.7969 43.3242 17.193 44.1332 17.4789C44.9422 17.7648 45.9172 17.9077 47.0582 17.9077V17.9077H53.9301Z"
        fill="#E2E7EA"
        stroke="#E2E7EA"
        stroke-width="0.75"
      />
      <motion.path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M35.6554 15.8741C34.3275 17.23 32.4116 17.908 29.908 17.908H27.5734C25.0697 17.908 23.1539 17.23 21.8259 15.8741C20.498 14.5182 19.834 12.4516 19.834 9.67446C19.834 6.88095 20.498 4.79806 21.8259 3.42581C23.1539 2.05356 25.0697 1.36743 27.5734 1.36743H29.908C32.4116 1.36743 34.3275 2.05356 35.6554 3.42581C36.9834 4.79806 37.6474 6.88095 37.6474 9.67446C37.6474 12.4516 36.9834 14.5182 35.6554 15.8741ZM27.5721 15.017H29.9066C31.5475 15.017 32.7444 14.5963 33.4972 13.755C34.25 12.9137 34.6264 11.5455 34.6264 9.65049C34.6264 7.75547 34.2542 6.38322 33.5099 5.53373C32.7655 4.68424 31.5644 4.2595 29.9066 4.2595H27.5721C25.9142 4.2595 24.7089 4.68424 23.9561 5.53373C23.2033 6.38322 22.8269 7.76364 22.8269 9.67499C22.8269 11.57 23.1991 12.9341 23.9434 13.7672C24.6877 14.6004 25.8973 15.017 27.5721 15.017Z"
        fill="#E2E7EA"
      />
      <motion.path
        d="M21.8259 15.8741L21.558 16.1365L21.558 16.1365L21.8259 15.8741ZM21.8259 3.42581L21.5565 3.16503L21.8259 3.42581ZM35.6554 3.42581L35.386 3.68659L35.6554 3.42581ZM33.4972 13.755L33.2177 13.5049L33.2177 13.5049L33.4972 13.755ZM23.9561 5.53373L23.6754 5.28502L23.6754 5.28502L23.9561 5.53373ZM23.9434 13.7672L23.6638 14.0171L23.6638 14.0171L23.9434 13.7672ZM29.908 18.283C32.479 18.283 34.5044 17.5853 35.9234 16.1365L35.3875 15.6117C34.1505 16.8748 32.3443 17.533 29.908 17.533V18.283ZM27.5734 18.283H29.908V17.533H27.5734V18.283ZM21.558 16.1365C22.9769 17.5853 25.0024 18.283 27.5734 18.283V17.533C25.1371 17.533 23.3309 16.8748 22.0939 15.6117L21.558 16.1365ZM19.459 9.67446C19.459 12.5045 20.1352 14.6837 21.558 16.1365L22.0939 15.6117C20.8607 14.3526 20.209 12.3987 20.209 9.67446H19.459ZM21.5565 3.16503C20.135 4.63385 19.459 6.82836 19.459 9.67446H20.209C20.209 6.93353 20.8609 4.96227 22.0954 3.68659L21.5565 3.16503ZM27.5734 0.992432C25.0012 0.992432 22.9751 1.69904 21.5565 3.16503L22.0954 3.68659C23.3327 2.40808 25.1383 1.74243 27.5734 1.74243V0.992432ZM29.908 0.992432H27.5734V1.74243H29.908V0.992432ZM35.9249 3.16503C34.5062 1.69904 32.4802 0.992432 29.908 0.992432V1.74243C32.3431 1.74243 34.1487 2.40808 35.386 3.68659L35.9249 3.16503ZM38.0224 9.67446C38.0224 6.82836 37.3463 4.63385 35.9249 3.16503L35.386 3.68659C36.6205 4.96227 37.2724 6.93353 37.2724 9.67446H38.0224ZM35.9234 16.1365C37.3462 14.6837 38.0224 12.5045 38.0224 9.67446H37.2724C37.2724 12.3987 36.6207 14.3526 35.3875 15.6117L35.9234 16.1365ZM29.9066 14.642H27.5721V15.392H29.9066V14.642ZM33.2177 13.5049C32.5634 14.2362 31.4901 14.642 29.9066 14.642V15.392C31.6049 15.392 32.9254 14.9564 33.7766 14.005L33.2177 13.5049ZM34.2514 9.65049C34.2514 11.5113 33.8789 12.7659 33.2177 13.5049L33.7766 14.005C34.621 13.0614 35.0014 11.5797 35.0014 9.65049H34.2514ZM33.2278 5.78086C33.8831 6.5287 34.2514 7.78937 34.2514 9.65049H35.0014C35.0014 7.72157 34.6253 6.23774 33.7919 5.2866L33.2278 5.78086ZM29.9066 4.6345C31.5078 4.6345 32.5827 5.04465 33.2278 5.78086L33.7919 5.2866C32.9483 4.32383 31.621 3.8845 29.9066 3.8845V4.6345ZM27.5721 4.6345H29.9066V3.8845H27.5721V4.6345ZM24.2367 5.78244C24.8907 5.04449 25.9712 4.6345 27.5721 4.6345V3.8845C25.8572 3.8845 24.5271 4.32399 23.6754 5.28502L24.2367 5.78244ZM23.2019 9.67499C23.2019 7.79729 23.5745 6.52973 24.2367 5.78244L23.6754 5.28502C22.8321 6.23671 22.4519 7.72999 22.4519 9.67499H23.2019ZM24.2231 13.5174C23.5706 12.7871 23.2019 11.5371 23.2019 9.67499H22.4519C22.4519 11.6029 22.8275 13.0811 23.6638 14.0171L24.2231 13.5174ZM27.5721 14.642C25.9505 14.642 24.867 14.2382 24.2231 13.5174L23.6638 14.0171C24.5085 14.9626 25.8441 15.392 27.5721 15.392V14.642Z"
        fill="#E2E7EA"
      />
      <motion.path
        d="M3.99251 17.9077V10.9975H12.7418V17.9077H15.7597V1.36719H12.7418V8.10593H3.99251V1.36719H1V17.9077H3.99251Z"
        fill="#E2E7EA"
        stroke="#E2E7EA"
        stroke-width="0.75"
      />
    </motion.svg>
  );
};
