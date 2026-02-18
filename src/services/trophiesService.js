import api from './api'

export const getMyTrophies = () => api.get('/trophies/mine')