import type { Ref } from 'vue'

export const usePersistedState = <T extends Object>(identifier: string, defaultOptions: T): Ref<T> => {
  const persistedObject = useState<T>(identifier, (): T => {
    const item = localStorage.getItem(identifier)
    if (!item || item === 'undefined')
      return defaultOptions

    return JSON.parse(item) as T ?? defaultOptions
  })

  watch(persistedObject, (object) => {
    localStorage.setItem(identifier, JSON.stringify(object))
  }, { deep: true })

  return persistedObject
}

export const useTemplateRailed = () => usePersistedState<boolean>('STATE_TEMPLATE_RAILED', false)

export const usePlaceholderPinned = () => usePersistedState<boolean>('STATE_PLACEHOLDER_PINNED', true)

export const useSelectedTemplate = (replacementId: string) => usePersistedState<number>(`STATE_REPLACEMENT_${replacementId}_SELECTED_TEMPLATE`, 0)
