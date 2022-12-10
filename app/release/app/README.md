# Production Release Notes

Release versions of Realm UI can be found here:

https://github.com/holium/realm/releases

## End Usage

## TODO

Document branching strategy: dev, staging, main...with additional beta for forefront users

### Auto Updates

Realm checks for updates when the app starts. Checks for updates will then occur every 10 mins after the initial check.

If updates are available, you will be prompted to download and install the updates.

### Manual Update

Manual checks can also be performed by clicking the Realm -> Check for Updates menu.

If updates are available, you will be prompted to download and install the updates.

### Versioning

Versioning is handled automatically during production builds. There is no need to manually update the version string in ./app/release/app/package.json.

### Prerelease

Prerelease builds run when changes are pushed to the `@holium/realm` repo's `staging` branch. These builds are added to GitHub Releases as `prerelease` which ensures they will **not** be picked up by the auto-update process. This also gives admins a chance to review a given prerelease before promoting to a new production grade update that will be picked up by the auto-updater.

### Release

Release builds run when changes are pushed to the `@holium/realm` repo's `main` branch. These builds are added to GitHub Releases as `release` builds which ensures they will be picked up by the auto-update process.

## FAQ

Why do I need to sign apps?

https://www.electronjs.org/docs/latest/tutorial/code-signing

Why not use Apple certificates to sign both Windows and Mac apps?

https://stackoverflow.com/questions/12468783/code-sign-windows-programs-with-apple-certificate

```
Now you need to get a Windows developer certificate. Unfortunately you can't use your Apple certificate (well, actually you can, but it doesn't help because Apple isn't a certificate authority that Windows recognizes). Here is a list of root certificate authorities recognized by Windows.
```
