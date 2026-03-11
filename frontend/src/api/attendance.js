import client from './client'

export const getAttendance = (params = {}) =>
  client.get('/api/attendance', { params }).then((r) => r.data)

export const markAttendance = (data) =>
  client.post('/api/attendance', data).then((r) => r.data)

export const getDashboardStats = () =>
  client.get('/api/dashboard').then((r) => r.data)
