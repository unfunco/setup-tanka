# GitHub Actions × Grafana Tanka

![CI](https://github.com/unfunco/setup-tanka/actions/workflows/ci.yaml/badge.svg)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-yellow.svg)](https://opensource.org/licenses/Apache-2.0)

Setup [Grafana Tanka] for use in GitHub Actions.

## Getting started

### Inputs

| Name            | Default    | Description            |
| --------------- | :--------: | ---------------------- |
| `tanka-version` | `"0.16.0"` | Grafana Tanka version. |

### Example usage

```jsonnet
local k = import "k.libsonnet";

{
  example: k.apps.v1.deployment.new(
    name="nginx",
    replicas=1,
    containers=[k.core.v1.container.new(
      name="nginx",
      image="nginx:latest",
    )],
  ),
}
```

The following workflow uses the action to apply a production configuration.

```yaml
name: Deploy

on:
  workflow_dispatch: { }

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v2
    - name: Setup Grafana Tanka
      uses: unfunco/setup-tanka@v1
      with:
        tanka-version: 0.16.0
    - name: Apply the configuration
      run: tk apply environments/production --dangerous-auto-approve
```

## License

© 2021 [Daniel Morris]  
Made available under the terms of the [Apache License 2.0](LICENSE.md).

[Daniel Morris]: https://unfun.co
[Grafana Tanka]: https://tanka.dev
