# vue3-lazyload

<div style="display:flex;width:100%;justify-content:center;">
<img src="https://img.shields.io/npm/v/vue3-lazyload" />
<img src="https://img.shields.io/github/package-json/dependency-version/murongg/vue3-lazyload/vue" />
<img src="https://img.shields.io/github/package-json/dependency-version/murongg/vue3-lazyload/dev/rollup/develop" />
</div>
<br />
<div style="display:flex;width:100%;justify-content:center;">
<img src="https://img.shields.io/travis/murongg/vue3-lazyload" />
<img src="https://img.shields.io/bundlephobia/min/vue3-lazyload" />
<img src="https://img.shields.io/github/repo-size/murongg/vue3-lazyload" />
<img src="https://img.shields.io/npm/l/vue3-lazyload" />
<img src="https://img.shields.io/github/issues/murongg/vue3-lazyload" />
<img src="https://img.shields.io/github/issues-pr/murongg/vue3-lazyload" />
</div>
<br />
A vue3.x image lazyload plugin.  
<br />

## Installation
```sh
$ npm i vue3-lazyload
# or
$ yarn add vue3-lazyload
```

## CDN

CDN: https://unpkg.com/vue3-lazyload/dist/vue3-lazyload.min.js
```html
<script src="https://unpkg.com/vue3-lazyload/dist/vue3-lazyload.min.js"></script>
<script>
  Vue.createApp(App).use(VueLazyLoad)
  ...
</script>
```

## Usage

main.js:

```js
import { createApp } from 'vue'
import App from './App.vue'
import VueLazyLoad from 'vue3-lazyload'

const app = createApp(App)
app.use(VueLazyLoad, {
  // options...
})
app.mount('#app')
```
App.vue:
```html
<template>
  <img v-lazy="your image url" />
</template>
```

### v-lazy use object params

```vue
<template>
  <img v-lazy="{ src: 'your image url', loading: 'your loading image url', error: 'your error image url' }" />
</template>
```

## Options

|  key   | description  | default | type |
|  ----  | ----  | ----  | ----  |
| loading  | The image used when the image is loaded | - | string |
| error  | The image used when the image failed to load | -  | string |
| observerOptions  | IntersectionObserver options | { rootMargin: '0px', threshold: 0.1 } | [IntersectionObserverInit]([链接地址](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver))|

## TODO
- [x] Migrate to typescript
- [x] rollup
- [x] eslint
- [x] overall unit tests
- [x] *.d.ts
- [x] Perfect type
- [ ] LazyComponent
- [ ] LazyImage
- [ ] LazyContainer
- [ ] Perfect example
- [ ] lifecycle
- [ ] commitlint & husky
