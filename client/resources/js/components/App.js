// --------------------------------------------------------------------------------------------------v
// Module: App

import axios from 'axios'
import Qs from 'qs'
import LocationMap from './LocationMap'
import ShareAsQrCode from './ShareAsQrCode'
import { compileTemplate } from '../util'

export default class App {

  constructor(el) {
    this.el = el

    this.template = `

      <nav class="sidenav" id="sidenav1">
        <a href="javascript:void(0)" class="closebtn">&times;</a>
        <a href="#" id="shareMapLink">Del som QR-kode</a>
        <a href="#" id="printMapLink">Skriv ut</a>
      </nav>

      <div id="header">
        <nav class="navbar navbar-dark bg-dark">
          <button class="navbar-toggler" type="button" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <a class="navbar-brand" href="#">Finn frem i biblioteket</a>
        </nav>
      </div>

      <div class="p-3">
        <p v-if="collection.name" class="">
          Boka <em>{{ title }}</em> finn du på hyllesignaturen
          <span style="font-weight: bold; color: blue">{{ callnumber }}</span>
          i
          <span v-if="collection.longName">
            <span style="font-weight: bold; color: blue">{{ collection.longName }}</span>
            (<span style="font-weight: bold; color: blue">{{ collection.name }}</span>)
          </span>
          <span v-else>
            <span style="font-weight: bold; color: blue">{{ collection.name }}</span>
          </span>
          i
          {{ collection.location.nb }}.
        </p>
      </div>

      <div id="main">
        <div id="map"></div>
        <div id="qrcode" class="p-3"></div>
      </div>

      <div id="footer">
        <div class="m-3" id="debug">
          Footer
        </div>
      </div>
    `
  }

  build() {
    // Constructor
    const query = Qs.parse(document.location.search);

    this.queryLocation(query)
      .then(data => this.ready(data))
      .catch(error => this.handleError(error))
      ;

    return this;
  }

  queryLocation(query) {
    return axios.get('https://ub-www01.uio.no/realfagsbiblioteket-kart/map.php', {
      params: {
        format: 'json',
        collection: query.loc,
        callnumber: query.shelf,
        title: query.bib,
      },
    })
    .then(response => response.data);
  }

  ready(data) {
    // Build template
    const compiled = compileTemplate(this.template, data);
    document.querySelector(this.el).innerHTML = compiled;

    // On next tick
    setTimeout(() => {
      this.map = (new LocationMap('map', data)).build();
      this.qrcode = (new ShareAsQrCode('qrcode', data)).build();
      this.initBindings();
    });
  }

  initBindings() {
    document.querySelector('.navbar-toggler').addEventListener('click', this.openMenu.bind(this));
    document.querySelector('.closebtn').addEventListener('click', this.closeMenu.bind(this));
    document.querySelector('#shareMapLink').addEventListener('click', this.shareMap.bind(this));
    document.querySelector('#printMapLink').addEventListener('click', this.printMap.bind(this));
  }

  openMenu(ev) {
    document.getElementById("sidenav1").classList.add('visible');
  }

  closeMenu(ev) {
    document.getElementById("sidenav1").classList.remove('visible')
  }

  handleError(error) {
    // handle error
    console.error(error);
  }

  shareMap(ev) {
    this.qrcode.show();
    this.closeMenu();
  }

  printMap(ev) {
    this.closeMenu();
    window.print();
  }
}
