/**
 * @typedef {import("../models/features/Feature").default} Feature
 */

import EditPopup from './EditPopup'

class RoomEditPopup extends EditPopup {
  constructor () {
    super()

    this.props = [
      'name',
      'building',
      'floor',
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
          <div><b>Bygning:</b></div>
          <div>
            <input type="text" class="form-control buildingInput" name="building">
          </div>
        </div>
        <div>
          <div><b>Etasje:</b></div>
          <div>
            <input type="text" class="form-control floorInput" name="floor">
          </div>
        </div>
      </div>`
  }

  open (ev) {
    super.open(ev)
    setTimeout(() => {
      this.currentPopupEl.querySelector('.nameInput').focus()
    })
  }
}

export default RoomEditPopup
