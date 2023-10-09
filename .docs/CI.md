## Continuous Integration Notes

### Environment variables

Environment variables are set by CI differently between mac/linux and windows builds.

**On Max/Linux**

Webpack config files are used to set environment variables. mac/linux handles extensive command line argument passing and nesting better. This simplifies CI significantly because command line args can be specified directly in the workflow scripts.

To see how runtime environment variables are set for mac/linux, please refer to this file:

`app/.holium/configs/webpack.config.renderer.prod.ts`

The environment variable references found in this file are set during the CI/build process and are "baked" into the final deployment artifacts.

**On Windows**

Since Windows has trouble with extensive command line argument passing and nesting, Windows builds generate a .env file during CI and this file is incorporated into the final set of deployment artifacts. This ensures that all necessary/required environment variables are available at runtime.

To see how the .env file is generated for windows builds, refer to the build-windows jobs in the following files:

**production** - .github/workflows/production-build.yml
**staging** - .github/workflows/staging-build.yml
