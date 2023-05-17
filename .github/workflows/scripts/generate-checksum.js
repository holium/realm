var fs = require('fs');
const crypto = require('crypto');

// @see this for more information:
//  https://stackoverflow.com/questions/46407362/checksum-mismatch-after-code-sign-electron-builder-updater

async function hashFile() {
  const filename = `./app/release/build/signed/Realm-Setup-${process.env.ARTIFACT_VERSION}.exe`;
  const algorithm = 'sha512';
  const encoding = 'base64';
  new Promise((resolve, reject) => {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats.size;
    const hash = crypto.createHash(algorithm);
    hash.on('error', reject).setEncoding(encoding);
    fs.createReadStream(filename, {
      highWaterMark: 1024 * 1024,
      /* better to use more memory but hash faster */
    })
      .on('error', reject)
      .on('end', () => {
        hash.end();
        console.log('hash done');
        const hashval = hash.read();
        console.log(hashval);
        // now rewrite the latest.yml file with these new values
        const yml = './app/release/build/latest.yml';
        const yaml = fs.readFileSync(yml).toString();
        let lines = yaml.split('\n');
        for (let j = 0; j < lines.length; j++) {
          let idx = lines[j].indexOf(':');
          if (idx === -1) {
            continue;
          }
          let raw = [];
          raw[0] = lines[j].substring(0, idx);
          raw[1] = lines[j].substring(idx + 1);
          const parts = lines[j].split(':');
          if (parts[0].trim() === 'sha512') {
            raw[1] = `${hashval}`;
          }
          if (parts[0].trim() === 'size') {
            raw[1] = `${fileSizeInBytes}`;
          }
          lines[j] = `${raw[0]}: ${raw[1].trim()}`;
        }
        fs.writeFileSync(yml, lines.join('\n'));
        resolve(hashval);
      })
      .pipe(hash, {
        end: false,
      });
  });
}

module.exports = async ({ github, context }, workflowId, platform, ci) => {
  await hashFile();

  return ci;
};
