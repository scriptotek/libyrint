import axios from 'axios'
import { API_BASE_URL } from './config'

class Api {
  constructor () {
    this.baseUrl = API_BASE_URL
  }

  request (method, config) {
    return axios.request({
      method: method,
      url: this.baseUrl,
      ...config,
    })
      .then(response => response.data)
  }

  get (action, params = {}) {
    return this.request('get', {
      params: {
        action: action,
        ...params,
      },
    })
  }

  post (action, data) {
    return this.request('post', {
      params: {
        action: action,
      },
      data: data,
    })
  }

  listLibraries () {
    return this.get('listLibraries')
  }

  getLibrary (id) {
    return this.get('getLibrary', { id: id }).then(res => res.library)
  }

  storeLibrary (data) {
    return this.request('post', {
      data: data,
      params: {
        action: 'storeLibrary',
      },
    })
  }

  listMaps (query = {}) {
    return this.get('listMaps', query)
  }

  getMap (id) {
    return this.get('getMap', { id: id }).then(res => res.map)
  }

  storeMap (data) {
    return this.request('post', {
      data: data,
      params: {
        action: 'storeMap',
      },
    })
  }

  storeMapBackground (data) {
    return this.post('storeMapBackground', data)
  }
}

const api = new Api()

export default api
