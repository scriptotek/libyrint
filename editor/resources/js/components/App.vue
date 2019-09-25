import axios from 'axios'
import MapData from '../models/MapData'
import MapEditor from './MapEditor'

import { compileTemplate } from '../util'

export default class App {

  constructor (el) {
    this.el = el
    this.map = null
    this.mapData = {}
    this.selectedFeature = null;
  }

  buildRooms () {
    console.log('[App] Build rooms list')
    document.getElementById('rooms').innerHTML = this.mapData.rooms.map(room => {
      return `<div style="background: #eee; padding: 2px;">Rom uten navn</div>`;
    }).join('')
  }

  build () {
    // Constructor
    const compiled = compileTemplate(this.template, {})
    document.querySelector(this.el).innerHTML = compiled

    document.getElementById('openMapBtn').addEventListener('click', () => {
      const mapUrl = document.getElementById('mapUrl').value

    })

    // AUTO-CLICK DURING DEV
    setTimeout(() => {
      document.getElementById('openMapBtn').click()
    }, 500)

    document.getElementById('newRoomBtn').addEventListener('click', () => {
      this.map.newRoom()
    })

    document.getElementById('newCollectionBtn').addEventListener('click', () => {
      this.map.newCollection()
    })

    return this
  }
}
