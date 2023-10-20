export const generateProfileSnap = (document: Document): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      // generate a new opengraph image using canvas
      const canvas: HTMLCanvasElement = document.createElement(
        'canvas'
      ) as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const avatar: HTMLImageElement | null = document.getElementById(
        'avatar-image'
      ) as HTMLImageElement;
      let avatarImage = new Image();
      avatarImage.src = avatar.src;
      avatarImage.crossOrigin = 'anonymous';
      avatarImage.onerror = () => reject('failed to load image');
      avatarImage.onload = () => {
        let rubik = new FontFace(
          'Rubik',
          'url(https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFV0U1dYPFkZVO.woff2)'
        );
        rubik
          .load()
          .then((font) => {
            document.fonts.add(font);
            canvas.width = 400;
            canvas.height = 140;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(120.0 / avatarImage.width, 120.0 / avatarImage.height);
            ctx.drawImage(avatarImage, 10, 10);
            const displayNameElem: HTMLInputElement | null =
              document.getElementById('display-name') as HTMLInputElement;
            ctx.font = "normal 32px 'Rubik'";
            const metrics = ctx.measureText(displayNameElem.value);
            const textHeight =
              metrics.actualBoundingBoxAscent +
              metrics.actualBoundingBoxDescent;
            ctx.fillStyle = '#333333';
            ctx.fillText(displayNameElem.value, 212, 10 + textHeight, 300);
            ctx.font = "normal 22px 'Rubik'";
            ctx.fillStyle = '#8e8e8e';
            ctx.fillText(
              'This is for testing purposes only.',
              212,
              10 + textHeight + 10 + textHeight,
              300
            );

            const dataUrl: string = canvas.toDataURL('image/png');
            resolve(dataUrl);
          })
          .catch((e) => reject(e));
      };
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
