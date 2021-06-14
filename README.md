# GitHub Actions × Grafana Tanka

## Getting started

### Usage example

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
