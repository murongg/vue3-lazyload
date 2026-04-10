import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VueLazyLoad from '../src'
import App from '../example/App.vue'

function mountExampleApp() {
  return mount(App, {
    global: {
      plugins: [[VueLazyLoad, { log: false }]],
    },
  })
}

describe('example app', () => {
  it('renders the playground structure and all demo labs', () => {
    const wrapper = mountExampleApp()

    expect(wrapper.text()).toContain('vue3-lazyload')
    expect(wrapper.text()).toContain('Control Center')
    expect(wrapper.text()).toContain('Directive Demo')
    expect(wrapper.text()).toContain('Hook Demo')
    expect(wrapper.text()).toContain('Lazy Component')
    expect(wrapper.text()).toContain('Event Console')
    expect(wrapper.text()).toContain('State Panel')
    expect(wrapper.text()).toContain('pnpm add vue3-lazyload')
  })

  it('updates hook demo source when the switch button is clicked', async () => {
    const wrapper = mountExampleApp()

    expect(wrapper.text()).toContain('Default source active')

    await wrapper.get('[data-test="hook-switch-source"]').trigger('click')

    expect(wrapper.text()).toContain('Alternate source active')
  })

  it('updates the lazy component mode label from the control center', async () => {
    const wrapper = mountExampleApp()

    expect(wrapper.text()).toContain('Mode: once')

    await wrapper.get('[data-test="mode-visible"]').trigger('click')

    expect(wrapper.text()).toContain('Mode: visible')
  })
})
