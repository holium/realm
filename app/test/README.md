## Testing

run `yarn test` with:

- `./zod/.run --http-port 8080`
- `./bus/.run --http-port 8081`
- `./dev/.run --http-port 8082`

### Info

We have to set ELECTRON_RUN_AS_NODE for running tests. The node version of
`better-sqlite-3` must match the version used by `jest`. See [this comment](https://github.com/WiseLibs/better-sqlite3/issues/545#issuecomment-824887942) for more
