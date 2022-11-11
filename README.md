# atlas-app
Deployment toolchain for Atlas smart contracts

## Prerequisites
1. Docker Desktop (Must be running)
2. Node.js ^16.17.0

## Installation
```sh
npm i atlas-app -g
```
## Usage
1. Create new app
    ```sh
    atlas-app new
    ```
2. Install development dependencies 
    ```sh
    cd your-app && npm i -f
    ```
3. Test smart contracts
    ```sh
    atlas-app test
    ```
3. Deploy an Atlas app
    ```sh
    atlas-app deploy
    ```

