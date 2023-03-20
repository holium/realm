const hideCursorCss = `
  * {
    cursor: none !important;
  }
  *::before,
  *::after {
    cursor: none !important;
  }
  *:hover {
    cursor: none !important;
  }
  *:active {
    cursor: none !important;
  }
  *:focus {
    cursor: none !important;
  }
  *:focus-within {
    cursor: none !important;
  }
  *:focus-visible {
    cursor: none !important;
  }
  *:focus:not(:focus-visible) {
    cursor: none !important;
  }
`;

export const HideCursorHelper = (webContents: Electron.WebContents) => {
  webContents.insertCSS(hideCursorCss);
};
