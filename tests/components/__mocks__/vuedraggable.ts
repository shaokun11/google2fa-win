import { defineComponent, h } from 'vue'

// Stub vuedraggable for tests - renders slot items directly
export default defineComponent({
  name: 'draggable',
  props: ['list', 'itemKey', 'ghostClass', 'dragClass', 'animation'],
  emits: ['end'],
  setup(props, { slots }) {
    return () => {
      if (!slots.default) return null
      const items = slots.default({
        element: props.list?.[0],
        index: 0
      })
      return h('div', { class: 'account-grid' }, items)
    }
  }
})
