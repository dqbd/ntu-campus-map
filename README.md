# NTU Campus Map

## Setup

Please follow the [Getting Started guide for React Native](https://facebook.github.io/react-native/docs/getting-started) for initial configuration

After setting up the environmnent, just execute
```
yarn start
```

## Production Release Build

Create a `android/keystore.properties` file with these contents

```
storeFile=
storePassword=
keyAlias=
keyPassword=
```

Perform the build 

```bash
./gradlew bundleRelease
```