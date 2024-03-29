import { FC } from 'react';

interface UrbitSVGProps {
  mode: 'light' | 'dark';
  size: number;
}

export const UrbitSVG: FC<UrbitSVGProps> = (props: UrbitSVGProps) => {
  const color = props.mode === 'light' ? '#333333' : '#ffffff';

  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M36 65.25C52.1543 65.25 65.25 52.1543 65.25 36C65.25 19.8457 52.1543 6.75 36 6.75C19.8457 6.75 6.75 19.8457 6.75 36C6.75 52.1543 19.8457 65.25 36 65.25Z"
        fillOpacity="0"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M49.5 31.6098H44.1688C43.7675 33.9696 42.7356 35.3963 40.9012 35.3963C37.5764 35.3963 35.6848 31.5 30.5255 31.5C25.5382 31.5 22.9012 34.5733 22.5 40.4451H27.8312C28.2326 38.0304 29.2644 36.6037 31.156 36.6037C34.4808 36.6037 36.2578 40.5 41.5318 40.5C46.4044 40.5 49.0988 37.4267 49.5 31.6098Z"
        fill={color}
      />
    </svg>
  );
};
