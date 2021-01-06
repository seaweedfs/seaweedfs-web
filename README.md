# seaweedfs-web

A Vue.js project to enhance default SeaweedFS Filer UI.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run e2e tests
npm run e2e

# run all tests
npm test
```

## Configure Address
> static\page_config.js
``` javascript
//  modify the filer address
window.g = {
  filer: '127.0.0.1:8888'
}
```

## Configure Language
>static\page_config.js
``` javascript
//  modify the filer language
window.g = {
  locale: 'language' // zh-CN ==> Chinese  en-US ==> English language
}
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
