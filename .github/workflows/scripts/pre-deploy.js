/*
  @author:  lodlev-migdev
  @purpose: script to setup context and environment variables to be used
    by other jobs/steps in the workflow.

*/
var fs = require('fs');

// did the "core" part of two version strings change
//  core being major.minor.build portion of version string
function versionDiff(a, b) {
  const a_matches = a.match(
    /(v|)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
  );
  const b_matches = b.match(
    /(v|)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
  );
  if (a_matches && b_matches) {
    return !(
      parseInt(a_matches[2]) === parseInt(b_matches[2]) &&
      parseInt(a_matches[3]) === parseInt(b_matches[3]) &&
      parseInt(a_matches[4]) === parseInt(b_matches[4])
    );
  }
}

module.exports = async ({ github, context }, workflowId) => {
  // console.log('PR => %o', context.payload.pull_request);
  let ci = {
    // if running from release title or default build with package.json version update
    isNewBuild: false,
    // releaseName - generated based on PR title (if exists); otherwise build based on package.json version
    releaseName: undefined,
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
    foundTag: false, // true if the tag exists; otherwise false
    releaseType: 'draft' | 'alpha' | 'release' | 'hotfix',
  };
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
  const buildTitle =
    (github.event_name === 'pull_request' &&
      context.payload.pull_request.title) ||
    'auto draft build';
  console.log(
    `init.js: PR title = '${buildTitle}'. testing if matches version format...`
  );
  let bumpVersion = false;
  // does the PR title match our required naming convention for manual staging/production builds?
  let matches = buildTitle.match(
    /(release|staging|hotfix)-(v|)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
  );
  // matches null if no match
  if (matches) {
    console.log(
      `init.js: '${buildTitle}' matches version format. using as version string.`
    );
    const tagName = `${matches[2] ? 'v' : ''}${matches[3]}.${matches[4]}.${
      matches[5]
    }${
      matches[1] === 'staging'
        ? '-alpha'
        : matches[1] === 'hotfix'
        ? '-hotfix'
        : ''
    }`;
    let tag = undefined;
    try {
      tag = await github.request(
        'GET /repos/{owner}/{repo}/releases/tags/{tag}',
        {
          owner: 'holium',
          repo: 'realm',
          tag: tagName,
        }
      );
    } catch (e) {
      console.log(e);
    }
    console.log('tag => %o', tag);
    if (tag) {
      throw Error(
        `error: tag '${tag} exists. please rename the PR and try again`
      );
    }
    ci.isNewBuild = true;
    ci.releaseName = buildTitle;
    ci.buildVersion = tagName;
    switch (matches[1]) {
      // test and staging builds produce alphas. the only difference is
      // that 'draft' stays in draft mode and sets the release channel used by auto-updater
      // to 'draft' or 'staging' respectively
      case 'draft':
      case 'staging':
        ci.channel = 'alpha';
        break;
      case 'hotfix':
        ci.channel = 'hotfix';
        break;
      case 'release':
        ci.channel = 'latest';
        break;
    }
    ci.releaseType = matches[1];
    // ci.channel = `${matches[1] === 'staging' ? 'alpha' : 'latest'}`;
    ci.version.major = parseInt(matches[3]);
    ci.version.minor = parseInt(matches[4]);
    ci.version.build = parseInt(matches[5]);
  } else {
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
      if (release.draft) {
        console.log(
          `${release.tag_name} found. will delete release and tag prior to build...`
        );
        ci.foundTag = true;
      }
      // ci.isNewBuild = !release.draft;
      ci.isNewBuild = true;
      // if the latest release is a draft, it means the prior build failed; therefore
      //  rerun the build using the same tag (version) information
      buildVersion = release.tag_name;
    } else {
      // otherwise if no releases found, use the version string from package.json
      buildVersion = pkg.version;
      ci.isNewBuild = true;
      bumpVersion = true;
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
    if (bumpVersion) {
      buildNumber++;
    }
    // if building from package.json version, bump the build # by 1
    ci.buildVersion = `${matches[1] ? 'v' : ''}${matches[2]}.${
      matches[3]
    }.${buildNumber}-${
      (github.event_name === 'pull_request' &&
      context.payload.pull_request.base.ref === 'draft'
        ? 'draft'
        : 'alpha') || 'draft'
    }`;
    ci.releaseName = `staging-${matches[1] ? 'v' : ''}${matches[2]}.${
      matches[3]
    }.${buildNumber}`;
    ci.version.major = parseInt(matches[2]);
    ci.version.minor = parseInt(matches[3]);
    ci.version.build = buildNumber;
    // all non-manual builds are considered staging (alpha)

    if (
      github.event_name === 'pull_request' &&
      context.payload.pull_request.base.ref === 'draft'
    ) {
      ci.channel = 'draft';
      ci.releaseType = 'draft';
    } else if (
      github.event_name === 'pull_request' &&
      context.payload.pull_request.base.ref === 'master'
    ) {
      ci.channel = 'alpha';
      ci.releaseType = 'alpha';
    } else {
      ci.channel = 'draft';
      ci.releaseType = 'draft';
    }
  }
  // see: https://www.electron.build/tutorials/release-using-channels.html
  // must append '-alpha' to the version in order to build assets with the '-alpha' appended.
  //  this is useful when checking the version in Realm -> About
  // pkg.version = ci.buildVersion;
  // must write build version string out to package.json since electron-builder
  //   will use this to name assets
  // fs.writeFileSync(packageFilename, JSON.stringify(pkg, null, 2));
  console.log(`building version ${ci.buildVersion}...`);
  console.log(ci);
  return ci;
};
