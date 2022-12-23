// import styled from 'styled-components';
import { rgba, darken, lighten } from 'polished';
import { ThemeType } from 'renderer/logic/theme';

export const applyStyleOverrides = (windowId: string, theme: ThemeType) => {
  const baseBg = theme.windowColor;
  const baseGray =
    theme.mode === 'light'
      ? darken(0.04, theme.windowColor)
      : lighten(0.005, theme.windowColor);
  switch (windowId) {
    case 'talk':
    case 'groups':
      return `
        .card {
          background: ${baseBg} !important;
        }
        .bg-white {
          background-color: ${baseBg} !important;
        }
        .bg-gray-50 {
          background-color: ${darken(0.02, baseGray)} !important;
          transition: 0.2s ease;  
        }
        
        .bg-gray-100 {
          background-color: ${darken(0.03, baseGray)} !important;
        }
        .bg-gray-200 {
          background-color: ${darken(0.04, baseGray)} !important;
        }
        .bg-gray-300 {
          background-color: ${darken(0.05, baseGray)} !important;
        }
        .bg-gray-400 {
          background-color: ${darken(0.06, baseGray)} !important;
        }
        .bg-gray-500 {
          background-color: ${darken(0.07, baseGray)} !important;
        }
        .bg-gray-600 {
          background-color: ${darken(0.08, baseGray)} !important;
        }
        .bg-gray-700 {
          background-color: ${darken(0.09, baseGray)} !important;
        }
        .bg-gray-800 {
          background-color: ${darken(0.1, baseGray)} !important;
        }
        .bg-gray-900 {
          background-color: ${darken(0.11, baseGray)} !important;
        }

        .text-black { 
          color: ${theme.textColor} !important;
        }
        .text-gray-800 {
          color: ${rgba(theme.textColor, 0.8)} !important;
        }
        .text-gray-700 {
          color: ${rgba(theme.textColor, 0.7)} !important;
        }
        .text-gray-600 {
          color: ${rgba(theme.textColor, 0.6)} !important;
        }
        .text-gray-500 {
          color: ${rgba(theme.textColor, 0.5)} !important;
        }
        .text-gray-400 {
          color: ${rgba(theme.textColor, 0.4)} !important;
        }
        .text-gray-300 {
          color: ${rgba(theme.textColor, 0.3)} !important;
        }
        .text-gray-200 {
          color: ${rgba(theme.textColor, 0.2)} !important;
        }
        .text-gray-100 {
          color: ${rgba(theme.textColor, 0.1)} !important;
        }
        .text-gray-50 {
          color: ${rgba(theme.textColor, 0.05)} !important;
        }

        a[href*='/apps/grid'] {
          display: none !important;
        }

        .hover\\:bg-gray-50:hover {
          background-color: ${darken(0.02, baseGray)} !important;
          transition: 0.2s ease;
        }

        .group:hover .group-hover\\:bg-gray-100 {
          background-color: ${darken(0.04, baseGray)} !important;
          transition: 0.2s ease;
        }

        .group-one:hover .group-one-hover\\:bg-gray-50 {
          background-color: ${baseGray} !important;
          transition: 0.2s ease;
        }

        .group-one:hover .group-one-hover\\:bg-gray-50 {
          background-color: ${darken(0.02, baseGray)} !important;
          transition: 0.2s ease;
        }


        .group-one-hover\\:bg-gray-50:hover {
          background-color: ${darken(0.02, baseGray)} !important;
          transition: 0.2s ease;
        }

        .group-one:hover .group-one-hover\\:bg-gray-50:hover {
          background-color: ${darken(0.02, baseGray)} !important;
          transition: 0.2s ease;
        }

        .group-two:hover .group-two-hover\\:bg-gray-50 {
          background-color: ${darken(0.02, baseGray)} !important;
        }

        .group:hover {
          background-color: ${darken(0.02, baseGray)} !important;
        }

        li[style*="cursor: none; background-color: rgb(191, 191, 191);"]:has(a[href*='/apps/groups/profile/edit']) {
          background-color: ${darken(0.02, baseGray)} !important;
        }

        nav.w-64 ul div.group:first-child {
          // TODO not <li>
          background-color: ${baseGray} !important;
        }

        
        .border-gray-50 {
          border-color: ${
            theme.mode === 'light' ? darken(0.1, baseBg) : darken(0.075, baseBg)
          } !important;
        }

        .border-gray-100 {
          border-color: ${darken(0.04, baseBg)} !important;
        }

      
        .border-t-2 {
          border-top-width: 1px !important;
        }

        .border-r-2 {
          border-right-width: 1px !important;
        }

        .border-b-2 {
          border-bottom-width: 1px !important;
        }

        .lg\\:border-l-2 {
          border-left-width: 1px !important;
        }
        .border-l-2 {
          border-left-width: 1px !important;
        }

        .input {
          background: ${
            theme.mode === 'light'
              ? darken(0.05, theme.inputColor)
              : lighten(0.03, theme.inputColor)
          } !important;
        }


        .input:focus-within { 
          border-color: ${theme.accentColor} !important;
        }

        *::-webkit-scrollbar-track {
          border: solid 2px ${baseBg} !important;
        }

        *::-webkit-scrollbar-thumb {
          background: ${darken(0.05, baseBg)} !important;
          border: solid 2px ${baseBg} !important;
          border-radius: 20px;
        }

        .dropdown {
          background-color: ${
            theme.mode === 'dark' ? darken(0.02, baseBg) : baseBg
          } !important;
        }

        .dropdown-item:hover {
          background-color: ${
            theme.mode === 'dark'
              ? lighten(0.015, baseBg)
              : darken(0.01, baseBg)
          } !important;
        }

        div[id^="react-select-2"] {
          background-color: ${darken(0.1, baseBg)} !important;
        }

        .icon-button {
          background-color: transparent !important;
          transition: 0.2s ease;
        }

        .icon-button:hover {
          background-color: ${darken(0.01, baseBg)} !important;
          transition: 0.2s ease;
        }

        .dialog {
          background-color: ${lighten(0.025, baseBg)} !important;
        }


        .dialog-container {
          z-index: 100 !important;
        }

        .dialog .icon-button {
          background-color: transparent !important;
          transition: 0.2s ease;
        }

        .dialog .icon-button:hover {
          background-color: ${darken(0.01, baseBg)} !important;
          transition: 0.2s ease;
        }

        button[disabled] {
          cursor: not-allowed !important;
          opacity: 0.5 !important;
          color: ${rgba(theme.textColor, 0.5)} !important;
          background-color: ${
            theme.mode === 'light'
              ? darken(0.01, theme.windowColor)
              : lighten(0.01, theme.windowColor)
          } !important;
          transition: 0.2s ease;
        }

        .button:not([disabled]):not(.bg-red-soft):not(.bg-blue-soft):not(.bg-green-soft) {
          background-color: ${theme.accentColor} !important;
          transition: 0.2s ease;
        }

        .secondary-button {
          background-color: ${baseBg} !important;
          color: ${theme.textColor} !important;
          mix-blend-mode: unset !important;
          transition: 0.2s ease;
        }

        .secondary-button:hover {
          background-color: ${darken(0.01, baseBg)} !important;
          mix-blend-mode: unset !important;
          transition: 0.2s ease;
        }

        .mix-blend-multiply {
          mix-blend-mode: unset !important;
        }

        .bg-red-soft {
          background-color: ${rgba('#FF6240', 0.1)} !important;
        }

        .text-red {
          color: #FF6240 !important;
        }

        .bg-blue-soft {
          background-color: ${rgba('#4E9EFD', 0.1)} !important;
        }

        .text-blue {
          color: #4E9EFD !important;
        }

        .bg-green-soft {
          background-color: ${rgba('#0FC383', 0.1)} !important;
        }

        .text-green {
          color: #0FC383 !important;
        }
        
      `;

    default:
      return '';
  }
};
