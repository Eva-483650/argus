import axios from 'axios'
// 直接用相对路径，不要再写 baseURL 为 8000
export const postPredict = (payload) => axios.post('/api/predict', payload)


