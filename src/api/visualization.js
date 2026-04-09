import request from '@/utils/request'
/**
 * 数据可视化
 */
export const getVisualization = () => {
	return request({
		url: '/api/data'
	})
}