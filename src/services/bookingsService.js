import api from './api'

export const createBooking = (data) => api.post('/bookings', data)
export const getMyBookings = () => api.get('/bookings/mine')
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`)

export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status })

export const getOwnerBookings = () => api.get('/owner/bookings')
export const confirmBooking = (id) => api.patch(`/owner/bookings/${id}/confirm`)
export const completeBooking = (id) => api.patch(`/owner/bookings/${id}/complete`)
export const cancelBookingOwner = (id) => api.patch(`/owner/bookings/${id}/cancel`)
