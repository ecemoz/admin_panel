export function getErrorMessage(error) {
  if (!error) return 'Bir hata oluştu.'

  // Axios error response
  if (error.response?.data) {
    const data = error.response.data

    // Çeşitli backend message format'ları
    if (typeof data === 'string') return data
    if (data.message) return data.message
    if (data.error) return data.error
    if (data.title) return data.title
    if (data.detail) return data.detail
    if (data.description) return data.description
  }

  // Fallback mesajlar
  if (error.response?.status === 400) return 'Istek gecersiz.'
  if (error.response?.status === 403) return 'Bu islemi yapma yetkiniz yok.'
  if (error.response?.status === 404) return 'Kayit bulunamadi.'
  if (error.response?.status === 409) return 'Bir catisma olustu.'
  if (error.response?.status === 500) return 'Sunucu hatasi.'
  if (error.response?.status) return `Hata: ${error.response.status}`

  if (error.message) return error.message

  return 'Bir hata oluştu.'
}
