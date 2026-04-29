export function unwrapList(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.items)) return response.items
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.results)) return response.results
  return []
}

export function unwrapItem(response) {
  if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    return response.data
  }

  return response
}
