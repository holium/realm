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
module.exports = async ({ github, context }, workflowId) => {
  // disable this workflow to prevent multiple builds running simultaneously
  console.log(
    `disabling workflow ${workflowId} to prevent multiple simultaneous builds...`
  );
  await github.request(
    'PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable',
    {
      owner: 'holium',
      repo: 'realm',
      workflow_id: workflowId,
    }
  );
  const packageFilename = './app/release/app/package.json';
  // this script is always called at the root of the repo; therefore
  //  read release package.json for build info
  const pkg = JSON.parse(fs.readFileSync(packageFilename));
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
    let isNewBuild = false;
    let buildVersion = undefined;
    // grab the latest annotated tag of any kind (draft, prerelease, release), and interrogate it to determine
    //  how to move forward
    const releases = await github.request(
      'GET /repos/{owner}/{repo}/releases',
      {
        owner: 'holium',
        repo: 'realm',
        per_page: 1, // only give the last result
        sort: 'created',
        direction: 'desc',
      }
    );
    if (releases.data.length > 0) {
      const release = releases.data[0];
      isNewBuild = !release.draft;
      // if the latest release is a draft, it means the prior build failed; therefore
      //  rerun the build using the same tag (version) information
      buildVersion = release.tag_name;
    } else {
      // otherwise if no releases found, use the version string from package.json
      buildVersion = pkg.version;
      isNewBuild = true;
    }
    // sanity check to ensure version coming in from package.json matches expected semantic version convention
    matches = buildVersion.match(
      /(v|)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
    );
    if (!matches) throw Error("error: 'buildVersion' format unexpected");
    let buildNumber = parseInt(matches[4]);
    // only increment build # if last release was not a draft or no release found
    //  therefore version value of first build ever should be '0.0.0' which would
    //  build as version '0.0.1'
    if (isNewBuild) {
      buildNumber++;
    }
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
  console.log(`building version ${pkg.version}...`);
  // must write build version string out to package.json since electron-builder
  //   will use this to name assets
  fs.writeFileSync(packageFilename, JSON.stringify(pkg, null, 2));
  return ci;
};
