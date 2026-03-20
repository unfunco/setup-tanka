# GitHub Actions × Grafana Tanka

![CI](https://github.com/unfunco/setup-tanka/actions/workflows/ci.yaml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)

Setup [Grafana Tanka] for use with GitHub Actions.

Tanka is a utility that allows Kubernetes resources to be defined and managed
in the [Jsonnet] language.

## Getting started

When specifying `tanka-version` the `v` prefix can be omitted, additionally,
the patch number is not required if it is equal to zero. The versions `v0.16.0`,
`0.16.0`, `v0.16`, and `0.16` are all valid and all refer to the same semantic
version of Tanka.

### Inputs

| Name            |   Default   | Description            |
| --------------- |:-----------:| ---------------------- |
| `tanka-version` | `"v0.36.3"` | Grafana Tanka version. |

### Example usage

The following example workflow uses the setup-tanka action to automatically
apply resources to a production environment.

```yaml
name: Deploy

on:
  workflow_dispatch: {}

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    - name: Setup Grafana Tanka
      uses: unfunco/setup-tanka@v1
      with:
        tanka-version: 0.36.3
    - name: Apply the production configuration
      run: tk apply environments/production --dangerous-auto-approve
```

## License

© 2021 [Daniel Morris]  
Made available under the terms of the [MIT License](LICENSE.md).

[Daniel Morris]: https://unfun.co
[Grafana Tanka]: https://tanka.dev
[Jsonnet]: https://jsonnet.org
