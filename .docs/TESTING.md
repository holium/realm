# Holium Testing Strategy

## holium.hosting.com

The hosting website (hosting.holium.com) involves Stripe payments and is thus tested E2E with Cypress.

The Realm client itself is changed at a fast pace, so automated testing is not worth the cost at the time of writing.

## Test Distribution Moon

Moon: `~nimwyd-ramwyl-dozzod-hostyv`

`~nimwyd-ramwyl-dozzod-hostyv` runs on a Digital Ocean droplet:

Digital Ocean Team: `Holium - Moons only`
Projects: `Realm`
Droplet: `app-host-staging`

For access to the Digital Ocean team and project, please contact cody@holium.com.

### Test Moon App Deployment Steps

Staging builds deploy Urbit agent changes to the staging app host: `~nimwyd-ramwyl-dozzod-hostyv`:

1. The following files on the `%realm` desk are updated:

- desk.docket-0 - the version string is updated to reflect the version of the current build
- desk.ship - contents of this file are changed to `~nimwyd-ramwyl-dozzod-hostyv`

2. The `%usher` desk's `%marshal` agent is poked during deployments to `|commit` changes to the realm hoon sources to this moon
