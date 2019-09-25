/**
 * @typedef {import("../models/features/Feature").default} Feature
 */
import axios from 'axios'
import EditPopup from './EditPopup'
import mapData from '../models/MapData'

class MarkerEditPopup extends EditPopup {
  constructor () {
    super()
    this.onLookupClickHandler = this.onLookupClick.bind(this)
    this.onCoordsChangeHandler = this.onCoordsChange.bind(this)

    this.props = ['name', 'barcode', 'rotation']

    this.template = `
      <div>
        <div class="d-flex">
          <div>
            <strong>X:</strong>
            <input type="number" class="lng form-control form-control-sm">
          </div>
          <div>
            <strong>Y:</strong>
            <input type="number" class="lat form-control form-control-sm">
          </div>
        </div>

        <div>
          <div><b>Strekkode:</b></div>
          <div class="d-flex">
            <input type="text" class="barcodeInput form-control form-control-sm" name="barcode">
            <button style="flex: 1 0 auto" type="button" class="btn btn-success btn-sm lookupBtn">Slå opp</button>
          </div>
        </div>

        <div>
          <div><b>Signatur:</b></div>
          <input type="text" class="nameInput form-control form-control-sm" name="name" disabled="disabled">
        </div>

        <div>
          <div><b>Rotasjon:</b></div>
          <div>
            <div>
              <div class="form-check form-check-inline">
                <label>
                  <input type="radio" name="rotation" class="rotationInput form-check-input" value="270"> –90°
                </label>
              </div>
              <div class="form-check form-check-inline">
                <label>
                <input type="radio" name="rotation" class="rotationInput form-check-input" value="0"> 0°
              </label>
              </div>
              <div class="form-check form-check-inline">
                <label>
                  <input type="radio" name="rotation" class="rotationInput form-check-input" value="90"> 90°
                </label>
              </div>
              <div class="form-check form-check-inline">
                <label>
                  <input type="radio" name="rotation" class="rotationInput form-check-input" value="180"> 180°
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>`
  }

  open (ev) {
    super.open(ev)
    this.currentPopupEl.querySelector('.lookupBtn').addEventListener('click', this.onLookupClickHandler)

    const coords = this.currentShape.getLatLng()
    this.currentPopupEl.querySelector('.lat').value = coords.lat
    this.currentPopupEl.querySelector('.lng').value = coords.lng
    this.currentPopupEl.querySelector('.lat').addEventListener('change', this.onCoordsChangeHandler)
    this.currentPopupEl.querySelector('.lng').addEventListener('change', this.onCoordsChangeHandler)

    setTimeout(() => {
      this.currentPopupEl.querySelector('.barcodeInput').focus()
    })
  }

  close () {
    super.close()
    this.currentPopupEl.querySelector('.lookupBtn').removeEventListener('click', this.onLookupClickHandler)
    this.currentPopupEl.querySelector('.lat').removeEventListener('change', this.onCoordsChangeHandler)
    this.currentPopupEl.querySelector('.lng').removeEventListener('change', this.onCoordsChangeHandler)
  }

  /**
   * Custom getter for the rotation property.
   *
   * @protected
   * @returns string
   */
  getRotationValue () {
    const selectedEl = this.currentPopupEl.querySelector('.rotationInput:checked')
    if (!selectedEl) {
      return '0'
    }
    const newValue = selectedEl.value
    sessionStorage.setItem('LastUsedMarkerRotation', newValue)
    return newValue
  }

  /**
   * Custom setter for the rotation property.
   *
   * @protected
   * @returns string
   */
  setRotationValue (value) {
    value = value || '0'
    for (const el of this.currentPopupEl.querySelectorAll('.rotationInput')) {
      el.checked = false
    }
    const selected = this.currentPopupEl.querySelector(`.rotationInput[value="${value}"]`)
    selected.checked = true
  }

  onLookupClick () {
    const barcode = this.get('barcode')
    console.log('Looking up: ' + barcode)
    axios.get(`https://ub-www01.uio.no/microservices/get_callcode.php?barcode=${barcode}`)
      .then(response => {
        this.set('name', response.data)
        this.store('name')
      })
  }

  onCoordsChange () {
    const lat = this.currentPopupEl.querySelector('.lat').value
    const lng = this.currentPopupEl.querySelector('.lng').value

    if (lat && lng) {
      console.log('Change to', lat, lng)
      this.currentShape.setLatLng([lat, lng])
      mapData.notify('shape:modified')
    }
  }
}

export default MarkerEditPopup
