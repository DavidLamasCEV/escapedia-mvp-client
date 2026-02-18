import api from './api'

// Acciones del usuario
export const createBooking = (data) => api.post('/bookings', data)
export const getMyBookings = () => api.get('/bookings/mine')
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`)

// Acciones del owner
export const getOwnerBookings = () => api.get('/owner/bookings')
export const confirmBooking = (id) => api.patch(`/owner/bookings/${id}/confirm`)
export const completeBooking = (id) => api.patch(`/owner/bookings/${id}/complete`)
export const cancelBookingOwner = (id) => api.patch(`/owner/bookings/${id}/cancel`)