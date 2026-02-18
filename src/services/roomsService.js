import api from './api'

export const getRooms = (params) => api.get('/rooms', { params })
export const getRoomById = (id) => api.get(`/rooms/${id}`)

export const getRoomAvailability = (roomId, date) =>
  api.get(`/rooms/${roomId}/availability`, { params: { date } })

export const createRoom = (data) => api.post('/rooms', data)
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data)
export const deleteRoom = (id) => api.delete(`/rooms/${id}`)
