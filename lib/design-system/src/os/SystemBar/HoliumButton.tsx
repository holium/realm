import { motion } from 'framer-motion';
import { darken } from 'polished';
import styled from 'styled-components';
import { getVar } from '../../util/colors';

const CrossPath = styled(motion.path)`
  transition: var(--transition);
  fill: var(--rlm-text-color);
  &:hover {
    cursor: pointer;
  }
`;

const CirclePath = styled(motion.circle)`
  transition: var(--transition);
  fill: ${() => darken(0.6, getVar('dock'))};
`;

const HoliSvg = styled(motion.svg)`
  &:hover {
    ${CirclePath} {
      transition: var(--transition);
      cursor: pointer;
      fill: ${() => darken(1, getVar('dock'))};
    }
  }
  &:active {
    ${CirclePath} {
      transition: var(--transition);
      cursor: pointer;
      fill: ${() => darken(1.5, getVar('dock'))};
    }
  }
`;

export const HoliumButton = () => {
  return (
    <HoliSvg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_ii_360_6399)">
        <CirclePath cx="14" cy="14" r="14" fillOpacity="0.2" />
      </g>
      <CrossPath
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.6893 3.53857C17.1382 3.69894 19.5416 4.715 21.4133 6.58673C23.2851 8.45846 24.3011 10.8618 24.4615 13.3108H17.5706C15.9793 13.3108 14.6893 12.0207 14.6893 10.4294V3.53857ZM24.4572 14.7515C24.2839 17.1789 23.2692 19.5575 21.4133 21.4134C19.5416 23.2851 17.1382 24.3011 14.6893 24.4615V17.6328C14.6893 16.0415 15.9793 14.7515 17.5706 14.7515H24.4572ZM13.2486 24.4573C10.8212 24.2839 8.44259 23.2693 6.5867 21.4134C4.7308 19.5575 3.71617 17.1789 3.5428 14.7515H10.3672C11.9586 14.7515 13.2486 16.0415 13.2486 17.6328V24.4573ZM3.53854 13.3108C3.69892 10.8618 4.71497 8.45846 6.5867 6.58673C8.44259 4.73083 10.8212 3.7162 13.2486 3.54283V10.4294C13.2486 12.0207 11.9586 13.3108 10.3672 13.3108H3.53854Z"
        fillOpacity="0.7"
      />
      <defs>
        <filter
          id="filter0_ii_360_6399"
          x="0"
          y="0"
          width="28"
          height="28"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="0.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_360_6399"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_innerShadow_360_6399"
            result="effect2_innerShadow_360_6399"
          />
        </filter>
      </defs>
    </HoliSvg>
  );
};
