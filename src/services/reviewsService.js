import api from './api'

export const getReviewsByRoom = (roomId) => api.get(`/rooms/${roomId}/reviews`)
export const createReview     = (data)   => api.post('/reviews', data)
export const getMyReviews     = ()       => api.get('/reviews/mine')