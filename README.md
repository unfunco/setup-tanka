# GitHub Actions × Grafana Tanka

![CI](https://github.com/unfunco/setup-tanka/actions/workflows/ci.yaml/badge.svg)

Setup [Grafana Tanka] for use in GitHub Actions.

## Getting started

### Inputs

| Name            | Default    | Description            |
| --------------- | :--------: | ---------------------- |
| `tanka-version` | `"0.16.0"` | Grafana Tanka version. |

### Example usage

```yaml
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
