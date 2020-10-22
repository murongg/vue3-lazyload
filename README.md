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

## 🚀 Features
- ⚡ **0 dependencies:** No worry about your bundle size
- 🦾 **Type Strong:** Written in Typescript
- 💪 **Small Size:** Only 4kb
- 🌎 **Browser support:** Use it through CDN

## 📎 Installation
```sh
$ npm i vue3-lazyload
# or
$ yarn add vue3-lazyload
```

## 🌎 CDN

CDN: https://unpkg.com/vue3-lazyload/dist/vue3-lazyload.min.js
```html
<script src="https://unpkg.com/vue3-lazyload/dist/vue3-lazyload.min.js"></script>
<script>
  Vue.createApp(App).use(VueLazyLoad)
  ...
</script>
```

## 👽 Usage

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

### Use lifecycle

In main.js

```js
import { createApp } from 'vue'
import App from './App.vue'
import VueLazyLoad from 'vue3-lazyload'

const app = createApp(App)
app.use(VueLazyLoad, {
  loading: () => {
    console.log('loading')
  },
  error: () => {
    console.log('error')
  },
  loaded: () => {
    console.log('loaded')
  }
})
app.mount('#app')
```

or

In xxx.vue
> Have to be aware of is v-lazy don't use v-lazy="lazyOptions", in this case, vue cannot monitor data changes.

```vue
<template>
  <img v-lazy="{src: lazyOptions.src, lifecycle: lazyOptions.lifecycle}" width="100"> 
</template>

<script>
import { reactive } from 'vue'
export default {
  name: 'App',
  setup() {
    const lazyOptions = reactive({
      src: 'your image url',
      lifecycle: {
        loading: () => {
          console.log('image loading')
        },
        error: () => {
          console.log('image error')
        },
        loaded: () => {
          console.log('image loaded')
        }
      }
    })
    return {
      lazyOptions,
    }
  }
}
</script>

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

## 📁 Options

|  key   | description  | default | type |
|  ----  | ----  | ----  | ----  |
| loading  | The image used when the image is loaded | - | string |
| error  | The image used when the image failed to load | -  | string |
| observerOptions  | IntersectionObserver options | { rootMargin: '0px', threshold: 0.1 } | [IntersectionObserverInit]([链接地址](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver))|
| log  | Do not print debug info	 | true  | boolean |
| lifecycle  | Specify state execution function	 | -  | [Lifecycle](#Lifecycle) |

## ⛱ Lifecycle Hooks

|  key   | description  |
|  ----  | ----  |
| loading  | Image loading |
| loaded  | Image loaded |
| error  | Image load error |

## 📄 TODO
- [x] Migrate to typescript
- [x] rollup
- [x] eslint
- [x] overall unit tests
- [x] *.d.ts
- [x] Perfect type
- [x] lifecycle
- [x] commitlint & husky
- [ ] LazyComponent
- [ ] LazyImage
- [ ] LazyContainer
- [ ] Perfect example
