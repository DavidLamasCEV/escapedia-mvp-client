import api from './api'

export const createLocal = (data) => api.post('/locales', data)
export const getMyLocales = () => api.get('/locales/mine')
export const getAllLocales = (params) => api.get('/locales', { params })
export const updateLocal = (id, data) => api.put(`/locales/${id}`, data)
export const deleteLocal = (id) => api.delete(`/locales/${id}`)

export const getPublicLocales = () => api.get('/locales/public')
export const getPublicLocalById = (id) => api.get(`/locales/public/${id}`)
export const getPublicRoomsByLocal = (id) => api.get(`/locales/public/${id}/rooms`)


export const uploadLocalCover = (id, file) => {
  const form = new FormData()
  form.append('image', file)

  return api.post(`/locales/${id}/cover`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const deleteLocalCover = (id) => api.delete(`/locales/${id}/cover`)
