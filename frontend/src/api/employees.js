import client from './client'

export const getEmployees = () =>
  client.get('/api/employees').then((r) => r.data)

export const getEmployee = (id) =>
  client.get(`/api/employees/${id}`).then((r) => r.data)

export const createEmployee = (data) =>
  client.post('/api/employees', data).then((r) => r.data)

export const deleteEmployee = (id) =>
  client.delete(`/api/employees/${id}`)
