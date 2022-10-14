# Production Release Notes

Release versions of Realm UI can be found here:

https://github.com/holium/realm/releases

## End Usage

### Auto Updates

Realm checks for updates when the app starts. Checks for updates will then occur every 10 mins after the initial check.

If updates are available, you will be prompted to download and install the updates.

### Manual Update

Manual checks can also be performed by clicking the Realm -> Check for Updates menu.

If updates are available, you will be prompted to download and install the updates.

## Technical Notes

### Versioning

To version builds, make sure to bump the `version` found in `./app/release/app/package.json` file prior to check-in. This will ensure that the new release is published and detected by the auto-update process.

### Prerelease

Prerelease builds run when changes are pushed to the `@holium/realm` repo's `staging` branch. These builds are added to GitHub Releases as `drafts` which ensures they will **not** be picked up by the auto-update process.

### Release

Release builds run when changes are pushed to the `@holium/realm` repo's `main` branch. These builds are added to GitHub Releases as `release` builds which ensures they will be picked up by the auto-update process.
