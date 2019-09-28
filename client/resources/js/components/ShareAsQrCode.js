// --------------------------------------------------------------------------------------------------v
// Module: QrCode

import QRCode from 'qrcode'
import { compileTemplate } from '../util'

export default class ShareAsQrCode {

  constructor(el, data) {
    this.el = el;
    this.template = `
      <canvas id="qr_canvas"></canvas>
      <p>
        Kartet kan deles med QR-koden over
      </p>
    `;
  }

  show() {
    document.getElementById(this.el).style.display = "block";
  }
  hide() {
    document.getElementById(this.el).style.display = "none";
  }

  build() {
    let el = document.getElementById(this.el);

    // Build template
    const compiled = compileTemplate(this.template, {});
    el.innerHTML = compiled;

    el.addEventListener('click', (ev) => {
      console.log('CLICK', ev.target, el);
      if (ev.target === el) {
        console.log('CLOSE')
        this.hide();
      }
    });

    setTimeout(async () => {
      try {
        await this.buildQrCode(window.location.href);
      } catch (err) {
        console.error(err)
        return
      }

    })

    return this;
  }

  buildQrCode(url) {
    var canvas = document.getElementById('qr_canvas');
    QRCode.toCanvas(canvas, url)
    // qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    // var qr = qrcode(9, 'M');
    // qr.addData(url);
    // console.log('make', url);
    // qr.make();
    // //  return qr.createTableTag();
    // return qr.createSvgTag(4);
    // return qr.createImgTag(4);
  }
}
