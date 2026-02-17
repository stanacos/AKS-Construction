# AKS Construction

Deploy a fully configured AKS environment in three steps.

## 1. Run the helper

```bash
./00-predeploy.sh
```

This installs dependencies and opens the configuration helper in your browser.

## 2. Configure your cluster

Select your operational and security presets, then fine-tune across the tabs.

![presets](docs/images/helper-presets.jpg)

![tabs](docs/images/helper-tabs.jpg)

## 3. Generate and run the scripts

Click the green **Generate Scripts** button to download `01-deploy.sh` and `02-postdeploy.sh`, then run them:

![deploy](docs/images/helper-deploy.jpg)

```bash
./01-deploy.sh
./02-postdeploy.sh
```

Press `Ctrl+C` in the terminal running the helper to stop the dev server when you're done.
