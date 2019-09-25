/**
 * @typedef {import("../models/features/Feature").default} Feature
 */

import EditPopup from './EditPopup'
import { shelvingSchemes } from '../config'

class CollectionEditPopup extends EditPopup {
  constructor () {
    super()

    this.props = [
      'name',
      'code',
      'shelvingScheme',
    ]

    this.template = `
      <div>
        <div>
          <div><b>Navn:</b></div>
          <div>
            <input type="text" class="form-control nameInput" name="name">
          </div>
        </div>

        <div>
          <div><b>Samlingskode:</b></div>
          <div>
            <input type="text" class="form-control codeInput" name="code">
          </div>
        </div>

        <div>
          <div><b>Klassifikasjons- eller hylleoppstillingssystem:</b></div>
          <div>
            <select name="shelvingScheme" class="form-control shelvingSchemeInput">
            </select>
          </div>
        </div>

        <hr>
        <div class="text-muted">
          Form <span class="shapesLength"></span>)
        </div>
      </div>`
  }

  open (ev) {
    super.open(ev)
    const selectOptions = shelvingSchemes.map(scheme => `<option value="${scheme.id}">${scheme.label}</option>`)
    this.currentPopupEl.querySelector('.shelvingSchemeInput').innerHTML = selectOptions

    // Update selection after we inserted the option elements
    this.set('shelvingScheme', this.currentFeature.getProperty('shelvingScheme', ''))

    const shapes = this.currentFeature.getShapes()
    const currentShapeIndex = shapes.indexOf(this.currentShape) + 1
    this.currentPopupEl.querySelector('.shapesLength').innerHTML = `${currentShapeIndex} av ${shapes.length}`

    setTimeout(() => {
      this.currentPopupEl.querySelector('.nameInput').focus()
    })
  }
}

export default CollectionEditPopup
