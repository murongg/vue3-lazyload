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
A Vue 3 lazyload plugin for images and component subtrees.  
<br />

## 🚀 Features
- ⚡ **0 runtime dependencies:** No worry about your bundle size
- 🦾 **Type Strong:** Written in Typescript
- 🌎 **Vue 3 only:** Built for Vue 3 applications and libraries
- 🌎 **Browser support:** Use it through CDN
- 😊 **Support Hook:** useLazyload
- 🧱 **Support LazyComponent:** Defer mounting slot content until it enters the viewport
- 🔁 **Support modes and events:** Keep content mounted once loaded, or mount/unmount with visibility events

## 📎 Installation
```sh
$ npm i vue3-lazyload
# or
$ yarn add vue3-lazyload
# or
$ pnpm add vue3-lazyload
```

## 🌎 CDN

CDN: `https://unpkg.com/vue3-lazyload`
```html
<script src="https://unpkg.com/vue3-lazyload"></script>
<script>
  Vue.createApp(App).use(VueLazyLoad)
  ...
</script>
```

## 👽 Usage

This package supports Vue 3 only.

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

## Which API Should I Use?

| API | Best for | What it controls |
| --- | --- | --- |
| `v-lazy` | Regular template images | Swaps image `src` when the element becomes visible |
| `useLazyload` | Images managed inside component logic | Reuses plugin defaults and lets the component drive source updates |
| `LazyComponent` | Expensive cards, charts, or nested subtrees | Delays mounting a whole slot subtree |

`v-lazy` and `useLazyload` are image-oriented. `LazyComponent` is for component-level lazy mounting.

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
> Do not pass a whole reactive object as `v-lazy="lazyOptions"`. Use inline object fields instead, otherwise Vue cannot track nested changes the way you expect.

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
  <img v-lazy="{ src: lazyOptions.src, lifecycle: lazyOptions.lifecycle }" width="100">
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
    const src = ref('https://picsum.photos/id/64/720/420')
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

    function switchSource() {
      src.value = 'https://picsum.photos/id/65/720/420'
    }

    return {
      lazyRef,
      switchSource,
    }
  }
}
</script>

<template>
  <img ref="lazyRef" class="image" width="320">
  <button @click="switchSource">
    Switch source
  </button>
</template>
```

If you install the plugin with `app.use(VueLazyLoad, options)`, `useLazyload()` will reuse the injected lazyload instance by default. If you pass local options to the hook, they are merged on top of the plugin defaults without mutating the global instance.

### Use LazyComponent

Use `LazyComponent` when the expensive part is not an image but a whole component subtree.

```vue
<template>
  <LazyComponent
    :delay="220"
    mode="once"
  >
    <template #placeholder>
      <div class="card-skeleton">
        Loading card...
      </div>
    </template>

    <ExpensiveChart />
  </LazyComponent>
</template>
```

`LazyComponent` supports two modes:

- `mode="once"`: mount the slot the first time it becomes visible, then keep it mounted
- `mode="visible"`: mount on enter, unmount on leave, and restore the placeholder

Example with visibility events:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const mounts = ref(0)
const unmounts = ref(0)
</script>

<template>
  <LazyComponent
    mode="visible"
    :delay="180"
    @visible-change="visible = $event"
    @load="mounts += 1"
    @unload="unmounts += 1"
  >
    <template #placeholder>
      <div>Waiting for viewport entry...</div>
    </template>

    <ExpensiveChart />
  </LazyComponent>

  <p>Visible: {{ visible }}</p>
  <p>Mounts: {{ mounts }}</p>
  <p>Unmounts: {{ unmounts }}</p>
</template>
```

`LazyComponent` is SSR-safe by default: the server render starts from the placeholder and the real slot content mounts only after client-side visibility is known.

### LazyComponent Props

| prop | description | default | type |
| --- | --- | --- | --- |
| `mode` | Mount strategy for the default slot | `'once'` | `'once' \| 'visible'` |
| `delay` | Time in milliseconds the component must remain visible before mounting | inherited from plugin options | `number` |
| `observerOptions` | IntersectionObserver options for the wrapper | inherited rootMargin/threshold defaults | `IntersectionObserverInit` |
| `tag` | Root element tag rendered by `LazyComponent` | `'div'` | `string` |

### LazyComponent Events

| event | payload | description |
| --- | --- | --- |
| `visible-change` | `boolean` | Fires whenever the wrapper enters or leaves the viewport |
| `load` | none | Fires when the default slot is mounted |
| `unload` | none | Fires when `mode="visible"` unmounts the default slot |

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
| observerOptions | IntersectionObserver options                                            | { rootMargin: '0px', threshold: 0 }   | [IntersectionObserverInit](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)             |
| log             | Do print debug info                                                     | true                                  | boolean                                                                                                       |
| logLevel        | Log level                                                               | error                                 | 'error' \| 'warn' \| 'info' \| 'debug' \| 'log'                                                              |
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
