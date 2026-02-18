import api from './api'

export const createLocal = (data) => api.post('/locales', data)
export const getMyLocales = () => api.get('/locales/mine')