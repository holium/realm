/*
  @author:  lodlev-migdev
  @purpose: script to setup context and environment variables to be used
    by other jobs/steps in the workflow.

  @returns

    JSON object (ci):

      packageVersion - package.json file version attribute value. if this value
        comes from the PR title, it will be "as-is". otherwise the build # will be
        incremented (where build # is v<major>.<minor>.<build>)

      buildVersion - the name of the release. also used to tag the build. this can
        differ from the package version

      channel - [alpha|latest] - translates to [staging|release]. the reason for using
        alpha/latest is due to electron-builder library. it expects alpha/beta/latest in support
        of channeling releases (see: https://www.electron.build/tutorials/release-using-channels.html)

*/
var fs = require('fs');
module.exports = ({ github, context }, pkgfile) => {
  const pkg = JSON.parse(fs.readFileSync(pkgfile));
  let ci = {
    // releaseName - generated based on PR title (if exists); otherwise build based on package.json version
    releaseName: undefined,
    // version "as-is" from package.json
    packageVersion: pkg.version,
    // version either set by PR title or calculated (build # incremented) if based on package.json version
    buildVersion: undefined,
    // version object - with major, minor, build #
    version: {
      major: undefined,
      minor: undefined,
      build: undefined,
    },
    // channel - alpha (staging) or undefined/latest (release)
    //   note: use alpha|latest to keep in line with channel naming expectations
    //     of the electron-builder library
    channel: undefined,
  };
  console.log(`init.js: package version = ${pkg.version}`);
  // PR title is a required property of the PR event
  console.log(
    `init.js: PR title = '${context.payload.pull_request.title}'. testing if matches version format...`
  );
  // does the PR title match our required naming convention for manual staging/production builds?
  let matches = context.payload.pull_request.title.match(
    /(release|staging)-(v|)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
  );
  // matches null if no match
  if (matches) {
    console.log(
      `init.js: '${context.payload.pull_request.title}' matches version format. using as version string.`
    );
    ci.releaseName = context.payload.pull_request.title;
    ci.buildVersion = `${matches[2] ? 'v' : ''}${matches[3]}.${matches[4]}.${
      matches[5]
    }`;
    // buildVersion and packageVersion will match if manually deploying
    ci.packageVersion = ci.buildVersion;
    ci.version.major = parseInt(matches[3]);
    ci.version.minor = parseInt(matches[4]);
    ci.version.build = parseInt(matches[5]);
    ci.channel = matches[1] === 'staging' ? 'alpha' : 'latest';
  } else {
    // sanity check to ensure version coming in from package.json matches expected semantic version convention
    matches = pkg.version.match(
      /(v|)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
    );
    if (!matches)
      throw Error("package.json - 'version' attribute format unexpected");
    // bump build # by 1
    const buildNumber = parseInt(matches[4]) + 1;
    // if building from package.json version, bump the build # by 1
    ci.buildVersion = `${matches[1] ? 'v' : ''}${matches[2]}.${
      matches[3]
    }.${buildNumber}`;
    ci.releaseName = `staging-${ci.buildVersion}`;
    ci.version.major = parseInt(matches[2]);
    ci.version.minor = parseInt(matches[3]);
    ci.version.build = buildNumber;
    // all non-manual builds are considered staging (alpha)
    ci.channel = 'alpha';
  }
  // see: https://www.electron.build/tutorials/release-using-channels.html
  // must append '-alpha' to the version in order to build assets with the '-alpha' appended.
  //  this is useful when checking the version in Realm -> About
  pkg.version = `${ci.version.major}.${ci.version.minor}.${ci.version.build}${
    ci.channel === 'alpha' ? '-alpha' : ''
  }`;
  fs.writeFileSync(pkgfile, JSON.stringify(pkg, null, 2));
  return ci;
};
