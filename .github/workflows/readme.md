Realm builds currently support 3 pipelines: development, test, staging, and release

## locations:

https://cloud.digitalocean.com/projects/8891e60e-9aee-4cc5-9ce9-badd94a00ebd/resources

ghproxy-staging - Github proxy server to test 'test' and 'staging' build pipelines. It is also used to house builds packaged and run on the local machine.

ghproxy - Github proxy server used to host release builds.

## development

The development build will run a full build package of the software. This build runs entirely on the local machine. It deploys (using ssh/scp) the built and packaged asset to the ghproxy-staging droplet located @ Digital Ocean.

# Testing App Auto Update Pipelines

Because builds require complex notarization processes and other code signing and 3rd party build features, setting all of this up locally to test is tedious and cumbersome at best. Also, it runs the risk of security codes, passwords, and other potentially sensitive information.

Fortunately, there is an easier solution. Force two consecutive draft builds and use the resulting

Here's how:

- PR and merge into the draft branch
-
