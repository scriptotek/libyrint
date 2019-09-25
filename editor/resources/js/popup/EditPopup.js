/**
 * @typedef {import("../models/features/Feature").default} Feature
 */
import { upperFirst } from 'lodash/string'
import EventMixin from '../models/EventMixin'

/**
 * @mixes EventMixin
 */
class EditPopup {
  constructor () {
    this.currentFeature = null
    this.currentShape = null
    this.currentPopupEl = null
    this.onChangeHandler = this.onChange.bind(this)
    this.openHandler = this.open.bind(this)
    this.closeHandler = this.close.bind(this)
    this.template = ''
    this.props = []
  }

  /**
   * @param {L.Path} layer
   * @param {Feature} feature
   * @param {L.LatLngExpression} latlng
   */
  bindAndOpen (layer, feature, latlng) {
    console.log('[EditPopup] Bind and open', feature)
    this.currentShape = layer
    this.currentFeature = feature

    layer
      .on('popupopen', this.openHandler)
      .on('popupclose', this.closeHandler)

    const template = `
      <div>
        ${this.template}
      </div>
    `
    layer.bindPopup(template, {
      minWidth: 250,
      maxWidth: 500,
      offset: [0, -10],
    }).openPopup(latlng)
  }

  open (ev) {
    this.currentPopupEl = ev.popup.getElement()

    this.props.forEach(prop => {
      this.set(prop, this.currentFeature.getProperty(prop, ''))

      for (const rel of this.currentPopupEl.querySelectorAll(`.${prop}Input`)) {
        rel.addEventListener('change', this.onChangeHandler)
      }
    })
  }

  close () {
    this.currentShape.unbindPopup()
    this.props.forEach(prop => {
      this.store(prop)
      for (const rel of this.currentPopupEl.querySelectorAll(`.${prop}Input`)) {
        rel.removeEventListener('change', this.onChangeHandler)
      }
    })
    this.currentShape
      .off('popupopen', this.openHandler)
      .off('popupclose', this.closeHandler)
  }

  /**
   *
   * @param {string} name
   * @param {string} value
   */
  set (name, value) {
    const customSetter = 'set' + upperFirst(name) + 'Value'
    if (this[customSetter] !== undefined) {
      this[customSetter](value)
    } else {
      this.currentPopupEl.querySelector(`.${name}Input`).value = value
    }
  }

  /**
   * @param {string} name
   * @returns {string}
   */
  get (name) {
    const customGetter = 'get' + upperFirst(name) + 'Value'
    const value = (this[customGetter] !== undefined)
      ? this[customGetter]()
      : this.currentPopupEl.querySelector(`.${name}Input`).value

    return (value === '') ? undefined : value
  }

  /**
   *
   * @param {string} prop
   */
  store (prop) {
    this.currentFeature.setProperty(prop, this.get(prop))
  }

  onChange (event) {
    const prop = event.target.name
    if (!prop) {
      throw new Error('Tried changing unknown property')
    }
    this.store(prop)
  }
}

Object.assign(EditPopup.prototype, EventMixin)

export default EditPopup
