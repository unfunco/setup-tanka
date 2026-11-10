# GitHub Actions × Grafana Tanka

![CI](https://github.com/unfunco/setup-tanka/actions/workflows/ci.yaml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)

Setup [Grafana Tanka] for use with GitHub Actions.

Tanka is a utility that allows Kubernetes resources to be defined and managed
in the [Jsonnet] language.

## Getting started

Add the action to a job before any step that runs `tk`:

```yaml
name: Deploy

on:
  workflow_dispatch: {}

permissions:
  contents: read

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v7
    - name: Setup Grafana Tanka
      uses: unfunco/setup-tanka@v1
      with:
        tanka-version: 0.40.1
    - name: Apply the production configuration
      run: tk apply environments/production --dangerous-auto-approve
```

Pin `tanka-version` rather than relying on the default, which moves to newer
releases of Tanka over time.

### Inputs

| Name            | Default        | Description                                                              |
| --------------- | -------------- | ------------------------------------------------------------------------ |
| `tanka-version` | `0.40.1`       | Grafana Tanka version to install, `0.16.0` or later.                     |
| `token`         | Workflow token | Token used to read the Tanka release from the github.com API, see below. |

When specifying `tanka-version` the `v` prefix can be omitted, additionally,
the patch number is not required if it is equal to zero. The versions `v0.16.0`,
`0.16.0`, `v0.16`, and `0.16` are all valid and all refer to the same semantic
version of Tanka. Version ranges and `latest` are not supported.

### Outputs

| Name            | Example  | Description                                               |
| --------------- | -------- | --------------------------------------------------------- |
| `tanka-version` | `0.40.1` | The version of Grafana Tanka that was installed.          |
| `cache-hit`     | `false`  | Whether Grafana Tanka was found in the runner tool cache. |

```yaml
- name: Setup Grafana Tanka
  id: tanka
  uses: unfunco/setup-tanka@v1
- name: Print the installed version
  run: echo "Installed Tanka ${{ steps.tanka.outputs.tanka-version }}"
```

### Supported runners

Tanka is installed into the runner tool cache and added to `PATH`. Runners that
keep their tool cache between jobs reuse a version that has already been
downloaded.

| Operating system | Architectures                             |
| ---------------- | ----------------------------------------- |
| Linux            | x64, arm64, arm                           |
| macOS            | x64, arm64                                |
| Windows          | x64, arm64 (runs the x64 build, emulated) |

Not every version of Tanka was released for every platform, builds for macOS on
arm64 for example first appeared in 0.21.0.

### Download verification

Each download is compared with the SHA-256 digest that GitHub recorded when
Grafana uploaded it to the release, and is not installed if it differs. The
digest is read from the github.com API using the `token` input, which defaults
to the workflow token on github.com and to an unauthenticated request on GitHub
Enterprise Server.

Releases of Tanka before 0.33.0 were uploaded before GitHub began recording
digests, so they cannot be verified and are installed as they are. If the
release cannot be read, a warning is raised and the download is installed
without being verified.

### Pinning the action

`v1` is a tag that moves to each new 1.x release. To guard against the action
itself changing, reference a full commit SHA instead and let [Dependabot] keep
it up to date:

```yaml
- name: Setup Grafana Tanka
  uses: unfunco/setup-tanka@<commit SHA> # v1.0.0
```

## License

© 2021 [Daniel Morris]  
Made available under the terms of the [MIT License](LICENSE.md).

[Daniel Morris]: https://unfun.co
[Dependabot]: https://docs.github.com/en/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot
[Grafana Tanka]: https://tanka.dev
[Jsonnet]: https://jsonnet.org
