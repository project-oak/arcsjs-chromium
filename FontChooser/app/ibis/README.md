# Ibis - a knowledge engine for type checking asynchronously communicating modules

[![Ibis](https://github.com/project-oak/arcsjs-provable/actions/workflows/ibis.yml/badge.svg)](https://github.com/project-oak/arcsjs-provable/actions/workflows/ibis.yml)
[![Ibis docs](https://img.shields.io/badge/rustdoc-docs-green)](https://project-oak.github.io/arcsjs-provable/ibis/docs/ibis/)

#### This is not an officially supported Google product

# Getting started

Try out the [Ibis playground](https://project-oak.github.io/arcsjs-provable/ibis/playground).

(Early) documentation can be found [here](https://project-oak.github.io/arcsjs-provable/ibis/docs/ibis/) thanks to `Rustdoc`.

## Building and running Ibis locally

For the following you'll need [git]() and [cargo](https://rustup.rs).
```bash
# Assuming git and cargo are already installed
git clone https://github.com/project-oak/arcsjs-provable.git
cd arcsjs-provable/ibis
cat ./examples/demo.json | cargo run --bin dot > out.dot
```

Ibis also has a test suite that can be run with

```bash
cargo test
```

## Getting started with WASM

```bash
# Build the wasm
wasm-pack build --target web --release

# Run a server
npx http-server . -p 8001

# Open http://localhost:8001/playground
```

### Optional tools & dependencies
- [wasm-pack](https://github.com/rustwasm/wasm-pack) (for packaging WASM with JS)
- [cargo-wasi](https://bytecodealliance.github.io/cargo-wasi/install.html) (for compilation to WASM)
- [graphviz](https://graphviz.org/download/) (dot command is used to render debugging information)
- A web server:
  - Recommended: [the http.server package](https://www.npmjs.com/package/http-server) from npm.
  - Alternatively: [python3's http.server](https://docs.python.org/3/using/unix.html#getting-and-installing-the-latest-version-of-python).
  - or just your favourite web server.

# Contributing

Please see the project's [contributing guide](../contributing.md).

# License

Please see the project's [license](../LICENSE).
