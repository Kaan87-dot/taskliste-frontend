import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App.vue', () => {
  it('zeigt den Titel an', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Meine Taskliste')
  })
})
