export const measureImage = (
  src: string,
  containerWidth: number
): Promise<{ width: string; height: string }> => {
  const div = document.createElement('div');
  const tray = document.getElementById('messages-tray-app');
  if (!tray) {
    return new Promise((resolve) => resolve({ width: '0px', height: '0px' }));
  }
  div.style.visibility = 'hidden';
  div.style.position = 'absolute';
  div.style.top = '-1000px';
  div.style.left = '-1000px';
  div.style.width = `${containerWidth}px`;
  div.style.height = 'auto';
  div.style.padding = '8px';
  div.style.boxSizing = 'border-box';
  // div.style.minWidth = '9.375rem';
  div.style.minWidth = '150px';

  const img = document.createElement('img');
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.maxWidth = '20rem';
  tray.appendChild(div);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const height = Math.ceil(img.offsetHeight);
      const width = Math.ceil(img.offsetWidth);
      resolve({ width: `${width}px`, height: `${height}px` });
    };
    img.src = src;
    div.appendChild(img);
    img.onerror = reject;
  });
};
