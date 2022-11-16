import { darken, lighten } from 'polished';
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
    baseColor: string;
  }
>(({ baseColor, ...props }, svgRef) => {
  const lightestColor = lighten(0.05, baseColor);
  const lighterColor = lighten(0.1, baseColor);
  const semiDark = darken(0.1, baseColor);
  const darkColor = darken(0.2, baseColor);
  const darkerColor = darken(0.3, baseColor);
  return (
    <svg
      width={props.width}
      height={props.height}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_3863_14962)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M29.4001 15.0001C29.4001 22.953 22.953 29.4001 15.0001 29.4001C7.0472 29.4001 0.600098 22.953 0.600098 15.0001C0.600098 7.0472 7.0472 0.600098 15.0001 0.600098C22.953 0.600098 29.4001 7.0472 29.4001 15.0001ZM15.0001 29.0001C22.7321 29.0001 29.0001 22.7321 29.0001 15.0001C29.0001 7.26811 22.7321 1.0001 15.0001 1.0001C7.26811 1.0001 1.0001 7.26811 1.0001 15.0001C1.0001 22.7321 7.26811 29.0001 15.0001 29.0001Z"
          fill="url(#paint0_linear_3863_14962)"
          shapeRendering="crispEdges"
        />
      </g>
      <path
        d="M29 15C29 22.732 22.732 29 15 29C7.26801 29 1 22.732 1 15C1 7.26801 7.26801 1 15 1C22.732 1 29 7.26801 29 15Z"
        fill="url(#paint1_linear_3863_14962)"
      />
      <g filter="url(#filter1_d_3863_14962)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M26.4526 15C26.4526 21.3251 21.3251 26.4526 15 26.4526C8.67488 26.4526 3.54736 21.3251 3.54736 15C3.54736 8.67488 8.67488 3.54736 15 3.54736C21.3251 3.54736 26.4526 8.67488 26.4526 15ZM15 26.0526C21.1042 26.0526 26.0526 21.1042 26.0526 15C26.0526 8.89579 21.1042 3.94736 15 3.94736C8.89579 3.94736 3.94736 8.89579 3.94736 15C3.94736 21.1042 8.89579 26.0526 15 26.0526Z"
          fill="url(#paint2_linear_3863_14962)"
          shapeRendering="crispEdges"
        />
      </g>
      <path
        d="M26.0525 14.9999C26.0525 21.1041 21.1041 26.0525 14.9999 26.0525C8.8957 26.0525 3.94727 21.1041 3.94727 14.9999C3.94727 8.8957 8.8957 3.94727 14.9999 3.94727C21.1041 3.94727 26.0525 8.8957 26.0525 14.9999Z"
        fill="url(#paint3_linear_3863_14962)"
      />
      <g filter="url(#filter2_d_3863_14962)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23.5052 14.9999C23.5052 19.6972 19.6972 23.5052 14.9999 23.5052C10.3026 23.5052 6.49463 19.6972 6.49463 14.9999C6.49463 10.3026 10.3026 6.49463 14.9999 6.49463C19.6972 6.49463 23.5052 10.3026 23.5052 14.9999ZM14.9999 23.1052C19.4763 23.1052 23.1052 19.4763 23.1052 14.9999C23.1052 10.5235 19.4763 6.89463 14.9999 6.89463C10.5235 6.89463 6.89463 10.5235 6.89463 14.9999C6.89463 19.4763 10.5235 23.1052 14.9999 23.1052Z"
          fill="url(#paint4_linear_3863_14962)"
          shapeRendering="crispEdges"
        />
      </g>
      <path
        d="M23.1053 15C23.1053 19.4765 19.4765 23.1053 15 23.1053C10.5236 23.1053 6.89478 19.4765 6.89478 15C6.89478 10.5236 10.5236 6.89478 15 6.89478C19.4765 6.89478 23.1053 10.5236 23.1053 15Z"
        fill="url(#paint5_linear_3863_14962)"
      />
      <g filter="url(#filter3_d_3863_14962)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.5579 15C20.5579 18.0696 18.0696 20.5579 15 20.5579C11.9305 20.5579 9.44214 18.0696 9.44214 15C9.44214 11.9305 11.9305 9.44214 15 9.44214C18.0696 9.44214 20.5579 11.9305 20.5579 15ZM15 20.1579C17.8487 20.1579 20.1579 17.8487 20.1579 15C20.1579 12.1514 17.8487 9.84214 15 9.84214C12.1514 9.84214 9.84214 12.1514 9.84214 15C9.84214 17.8487 12.1514 20.1579 15 20.1579Z"
          fill="url(#paint6_linear_3863_14962)"
          shapeRendering="crispEdges"
        />
      </g>
      <path
        d="M20.1578 14.9999C20.1578 17.8486 17.8486 20.1578 14.9999 20.1578C12.1513 20.1578 9.84204 17.8486 9.84204 14.9999C9.84204 12.1513 12.1513 9.84204 14.9999 9.84204C17.8486 9.84204 20.1578 12.1513 20.1578 14.9999Z"
        fill="url(#paint7_linear_3863_14962)"
      />
      <defs>
        <filter
          id="filter0_d_3863_14962"
          x="0.600098"
          y="0.600098"
          width="28.9998"
          height="29"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.2" dy="0.2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.14902 0 0 0 0 0.0980392 0 0 0 0 0.156863 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3863_14962"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3863_14962"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_3863_14962"
          x="3.54736"
          y="3.54736"
          width="23.1053"
          height="23.1053"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.2" dy="0.2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.14902 0 0 0 0 0.0980392 0 0 0 0 0.156863 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3863_14962"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3863_14962"
            result="shape"
          />
        </filter>
        <filter
          id="filter2_d_3863_14962"
          x="6.49463"
          y="6.49463"
          width="17.2105"
          height="17.2105"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.2" dy="0.2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.14902 0 0 0 0 0.0980392 0 0 0 0 0.156863 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3863_14962"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3863_14962"
            result="shape"
          />
        </filter>
        <filter
          id="filter3_d_3863_14962"
          x="9.44214"
          y="9.44214"
          width="11.3157"
          height="11.3157"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.2" dy="0.2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.14902 0 0 0 0 0.0980392 0 0 0 0 0.156863 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3863_14962"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3863_14962"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_3863_14962"
          x1="5.45464"
          y1="4.81828"
          x2="25.8183"
          y2="23.2728"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={darkerColor} stopOpacity="0.4" />
          <stop
            offset="0.562223"
            stopColor={darkerColor}
            stopOpacity="0.737334"
          />
          <stop offset="1" stopColor={darkerColor} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_3863_14962"
          x1="7"
          y1="4"
          x2="22.5"
          y2="26.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={darkColor} />
          <stop offset="1" stopColor="#524C53" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_3863_14962"
          x1="7.99999"
          y1="6.0909"
          x2="23.2727"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={darkerColor} stopOpacity="0.4" />
          <stop offset="1" stopColor={darkerColor} />
        </linearGradient>
        <linearGradient
          id="paint3_linear_3863_14962"
          x1="8"
          y1="6"
          x2="23.5"
          y2="22.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={darkColor} />
          <stop offset="1" stopColor={baseColor} />
        </linearGradient>
        <linearGradient
          id="paint4_linear_3863_14962"
          x1="9.90897"
          y1="8.63624"
          x2="20.7271"
          y2="20.7271"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={darkerColor} stopOpacity="0.4" />
          <stop offset="1" stopColor={darkerColor} />
        </linearGradient>
        <linearGradient
          id="paint5_linear_3863_14962"
          x1="10"
          y1="9"
          x2="20.5"
          y2="20.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={darkColor} />
          <stop offset="1" stopColor={semiDark} />
        </linearGradient>
        <linearGradient
          id="paint6_linear_3863_14962"
          x1="11.8182"
          y1="10.5455"
          x2="18.8182"
          y2="19.4546"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={darkerColor} stopOpacity="0.4" />
          <stop offset="1" stopColor={darkerColor} />
        </linearGradient>
        <linearGradient
          id="paint7_linear_3863_14962"
          x1="11.5"
          y1="11.5"
          x2="19"
          y2="18.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={darken(0.05, baseColor)} />
          <stop offset="1" stopColor={darkerColor} stopOpacity="0.22" />
          <stop offset="1" stopColor={baseColor} />
        </linearGradient>
      </defs>
    </svg>
  );

  //   <motion.svg
  //     xmlns="http://www.w3.org/2000/svg"
  //     viewBox="0 0 24 24"
  //     width={props.width || '1em'}
  //     height={props.height || '1em'}
  //     fill="currentcolor"
  //     className="item"
  //   >
  //     <motion.circle
  //       cx="12px"
  //       cy="12px"
  //       r="11px"
  //       rotate="90%"
  //       fill="none"
  //       strokeWidth="1.5px"
  //       variants={{
  //         initial: { stroke: props.fill, pathLength: 0, opacity: 0.7 },
  //         show: { stroke: props.fill, pathLength: 1.1, opacity: 1 },
  //       }}
  //       initial="initial"
  //       animate="show"
  //     />
  //     <motion.path
  //       variants={{
  //         initial: {
  //           fill: props.fill,
  //           opacity: 0,
  //         },
  //         show: {
  //           fill: props.fill,
  //           opacity: 1,
  //           transition: { opacity: { delay: 1.2 }, fill: { duration: 1 } },
  //         },
  //       }}
  //       initial="initial"
  //       animate="show"
  //       // initial={{
  //       //   fill: props.fill,
  //       //   opacity: 0,
  //       //   transition: { delay: 1.2 }
  //       // }}
  //       // animate={{
  //       //   fill: props.fill,
  //       //   opacity: 0.9,
  //       //   // transition: { delay: 1.2, ease: 'easeInOut' },
  //       // }}
  //       // transition={{ initial: { delay: 1.2, ease: 'easeInOut' } }}
  //       fillRule="evenodd"
  //       clipRule="evenodd"
  //       d="M12.7747 3.02161C14.8164 3.19673 16.8097 4.06548 18.3721 5.62788C19.9345 7.19028 20.8033 9.18365 20.9784 11.2253H15.2389C13.8779 11.2253 12.7747 10.1221 12.7747 8.76116V3.02161ZM21 12.4574C20.8913 14.6089 20.0154 16.7289 18.3721 18.3721C16.8097 19.9345 14.8164 20.8033 12.7747 20.9784V14.9216C12.7747 13.5607 13.8779 12.4574 15.2389 12.4574H21ZM11.5426 21C9.39111 20.8913 7.27113 20.0154 5.62788 18.3721C3.98464 16.7289 3.10868 14.6089 3.00001 12.4574H9.07844C10.4394 12.4574 11.5426 13.5607 11.5426 14.9216V21ZM3.02162 11.2253C3.19672 9.18365 4.06548 7.19028 5.62788 5.62788C7.27113 3.98463 9.39111 3.10867 11.5426 3V8.76116C11.5426 10.1221 10.4394 11.2253 9.07844 11.2253H3.02162Z"
  //     />
  //   </motion.svg>
  // );
});

export const RealmAnimated = styled(SvgComponent)<IconProps>`
  flex: none;
  vertical-align: middle;
  ${compose(space, color, width, height, layout, typography)}
`;

export default RealmAnimated;
