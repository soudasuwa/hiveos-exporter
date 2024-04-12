import axios, { AxiosError } from 'axios'
import axiosRetry from 'axios-retry'

export const API_ROOT = 'https://api2.hiveos.farm/api/v2/'

export class HiveOSAPI {
	apiClient

	constructor(token) {
		this.apiClient = axios.create({
			baseURL: API_ROOT,
			headers: {
				'Authorization': `Bearer ${token}`,
			},
		})

		axiosRetry(this.apiClient, {
			retries: 3,
			retryDelay: (retryCount) => {
				return retryCount * 1000
			}
		})
	}

	async request(url = '/', method = 'GET', params = {}, data = undefined) {
		try {
			const response = await this.apiClient.request({
				method: method,
				url: url,
				params: params,
				data: data
			})

			return response.data
		} catch (error) {
			console.error(error)

			if (error instanceof AxiosError)
				throw new Error(error.response?.data)

			throw error
		}
	}
}
