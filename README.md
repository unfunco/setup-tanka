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
