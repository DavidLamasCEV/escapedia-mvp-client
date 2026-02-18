import api from './api'

export const createLocal = (data) => api.post('/locales', data)
export const getMyLocales = () => api.get('/locales/mine')

export const getAllLocales = (params) => api.get('/locales', { params })
export const updateLocal = (id, data) => api.put(`/locales/${id}`, data)
