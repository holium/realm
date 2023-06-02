export const RealmCursorIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_d_6255_17167)">
      <circle cx="8" cy="8" r="5" fill="var(--rlm-accent-color)" />
      <circle cx="8" cy="8" r="5.5" stroke="white" />
    </g>
    <defs>
      <filter
        id="filter0_d_6255_17167"
        x="0"
        y="0"
        width="16"
        height="16"
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
        <feOffset />
        <feGaussianBlur stdDeviation="1" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_6255_17167"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_6255_17167"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
