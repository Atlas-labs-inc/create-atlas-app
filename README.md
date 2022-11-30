# atlas-toolkit
Deployment toolchain for Atlas smart contracts

## Prerequisites
1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Node.js ^16.17.0

## Installation
```sh
npm i atlas-toolkit -g
```

## Usage
1. Login to Atlas
    ```sh
    atk login
    ```

2. Create new app
    ```sh
    atk new
    ```

3. Install development dependencies 
    ```sh
    cd your-app && npm i -f
    ```

4. Test smart contracts

    *[Docker Desktop](https://www.docker.com/products/docker-desktop/) must be running*
    ```sh
    atk test
    ```

5. Deploy contracts to your chain

    *[Docker Desktop](https://www.docker.com/products/docker-desktop/) must be running*
    ```sh
    atk deploy
    ```
*Note you can use `atlas-toolkit` or `atk` to run all commands*