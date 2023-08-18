# vue3-lazyload

<div style="display:flex;width:100%;justify-content:center;">
<img src="https://img.shields.io/npm/v/vue3-lazyload" />
<img src="https://img.shields.io/github/package-json/dependency-version/murongg/vue3-lazyload/dev/rollup/develop" />
<img src="https://img.shields.io/npm/dw/vue3-lazyload" />
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

## 🚀 Features
- ⚡ **0 dependencies:** No worry about your bundle size
- 🦾 **Type Strong:** Written in Typescript
- 🌎 **Browser support:** Use it through CDN
- 😊 **Support Hook:** useLazyload

## 📎 Installation
```sh
$ npm i vue3-lazyload
# or
$ yarn add vue3-lazyload
```

## 🌎 CDN

CDN:  https://unpkg.com/vue3-lazyload
```html
<script src="https://unpkg.com/vue3-lazyload"></script>
<script>
  Vue.createApp(App).use(VueLazyLoad)
  ...
</script>
```

## 👽 Usage

main.js:

```js
import { createApp } from 'vue'
import VueLazyLoad from 'vue3-lazyload'
import App from './App.vue'

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
  <img v-lazy="{ src: 'your image url', loading: 'your loading image url', error: 'your error image url' }">
</template>
```

### Use lifecycle

In main.js

```js
import { createApp } from 'vue'
import VueLazyLoad from 'vue3-lazyload'
import App from './App.vue'

const app = createApp(App)
app.use(VueLazyLoad, {
  loading: '',
  error: '',
  lifecycle: {
    loading: (el) => {
      console.log('loading', el)
    },
    error: (el) => {
      console.log('error', el)
    },
    loaded: (el) => {
      console.log('loaded', el)
    }
  }
})
app.mount('#app')
```

or

In xxx.vue
> Have to be aware of is v-lazy don't use v-lazy="lazyOptions", in this case, vue cannot monitor data changes.

```vue
<script>
import { reactive } from 'vue'
export default {
  name: 'App',
  setup() {
    const lazyOptions = reactive({
      src: 'your image url',
      lifecycle: {
        loading: (el) => {
          console.log('image loading', el)
        },
        error: (el) => {
          console.log('image error', el)
        },
        loaded: (el) => {
          console.log('image loaded', el)
        }
      }
    })
    return {
      lazyOptions,
    }
  }
}
</script>

<template>
  <img v-lazy="{src: lazyOptions.src, lifecycle: lazyOptions.lifecycle}" width="100">
</template>

```

### Use Hook
```vue
<script lang="ts">
import { ref } from 'vue'
import { useLazyload } from 'vue3-lazyload'
export default {
  name: 'App',
  setup() {
    const src = ref('/example/assets/logo.png')
    const lazyRef = useLazyload(src, {
      lifecycle: {
        loading: () => {
          console.log('loading')
        },
        error: () => {
          console.log('error')
        },
        loaded: () => {
          console.log('loaded')
        }
      }
    })
    return {
      lazyRef
    }
  }
}
</script>

<template>
  <img ref="lazyRef" class="image" width="100">
</template>
```

#### Use css state

There are three states while image loading.  
You can take advantage of this feature, make different css controls for different states.  

- `loading` 
- `loaded` 
- `error`

```html
<img src="..." lazy="loading">
<img src="..." lazy="loaded">
<img src="..." lazy="error">
```
```css
<style>
  img[lazy=loading] {
    /*your style here*/
  }
  img[lazy=error] {
    /*your style here*/
  }
  img[lazy=loaded] {
    /*your style here*/
  }
</style>
```

### Delay loading of images

To avoid loading images that are only shortly visible (e. g. fast scrolling through list of images), a delay in milliseconds can be configured.
If a delay is set, an image is only loaded if it stays visible for the specified amount of time.

Set delay in object parameter:

```vue
<template>
  <img v-lazy="{ src: 'your image url', loading: 'your loading image url', error: 'your error image url', delay: 500 }">
</template>
```

## 📁 Options

| key             | description                                                             | default                               | type                                                                                                          |
| --------------- | ----------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| loading         | The image used when the image is loaded                                 | -                                     | string                                                                                                        |
| error           | The image used when the image failed to load                            | -                                     | string                                                                                                        |
| observerOptions | IntersectionObserver options                                            | { rootMargin: '0px', threshold: 0.1 } | [IntersectionObserverInit]([链接地址](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)) |
| log             | Do print debug info                                                     | true                                  | boolean                                                                                                       |
| logLevel             |   Log level                | error                                  | 'error' \| 'warn' \| 'info' \| 'debug' \| 'log'                                                                                                       |
| lifecycle       | Specify state execution function                                        | -                                     | [Lifecycle](#Lifecycle)                                                                                       |
| delay           | Time in milliseconds an image has to stay visible before loading starts | 0                                     | number                                                                                                        |

## ⛱ Lifecycle Hooks

| key     | description      |
| ------- | ---------------- |
| loading | Image loading    |
| loaded  | Image loaded     |
| error   | Image load error |

## [Contributors](https://github.com/murongg/vue3-lazyload/graphs/contributors)

![Contributors](https://contrib.rocks/image?repo=murongg/vue3-lazyload)
