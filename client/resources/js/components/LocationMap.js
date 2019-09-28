// --------------------------------------------------------------------------------------------------v
// Module: LocationMap

import concaveman from 'concaveman'
import { flattenDeep } from 'lodash/array'
import center from '@turf/center'
import { polygon as turfPolygon } from '@turf/helpers'
import {
  Browser, CRS, LatLng,
  Map as LeafletMap, Control as LeafletControl,
  imageOverlay, marker, geoJSON, divIcon, polygon, circle
} from 'leaflet'
// import { Simple } from 'leaflet/src/geo/crs/CRS.Simple'
import explode from '@turf/explode'

var geoJsonData= {
  "type": "FeatureCollection",
  "features": [

    // Kjemisamlingen
    {
      "id": "01",
      "type": "Feature",
      "properties": {
        "name": "Kjemisamlingen",
        "color": "red",
      },
      "geometry": {
        "type": "MultiPolygon",
        // Note: GeoJson coordinates are [x, y], not [y, x]
        "coordinates": [
          [ // first shelf
            [
              [ 484,      133       ],
              [ 484 + 35, 133       ],
              [ 484 + 35, 133 + 585 ],
              [ 484,      133 + 585 ],
            ],
          ],

          [ // second shelf
            [
              [ 603,      240       ],
              [ 603 + 35, 240       ],
              [ 603 + 35, 240 + 478 ],
              [ 603,      240 + 478 ],
            ],
          ],

          [ // third shelf
            [
              [ 721,      133       ],
              [ 721 + 35, 133       ],
              [ 721 + 35, 133 + 585 ],
              [ 721,      133 + 585 ],
            ],
          ],
        ],
      }
    },

    // Matematikksamlingen
    {
      "id": "02",
      "type": "Feature",
      "properties": {
        "name": "Matematikksamlingen",
        "color": "yellow",
      },
      "geometry": {
        "type": "MultiPolygon",
        // Note: GeoJson coordinates are [x, y], not [y, x]
        "coordinates": [

          [ // LEC
            [
              [ 1455,  803 ],
              [ 1668,  803 ],
              [ 1668,  820 ],
              [ 1455,  820 ],
            ],
          ],

          [ // first normal shelf
            [
              [ 1871,  133 ],
              [ 1907,  133 ],
              [ 1907,  133 + 585 ],
              [ 1871,  133 + 585 ],
            ],
          ],

          [ // bottom shelf 1
            [
              [  890,    9 ],
              [ 2115,    9 ],
              [ 2115,   24 ],
              [  890,   24 ],
            ],
          ],

        ],
      }
    }
  ]
};


export default class LocationMap {

  constructor(el, data) {
    this.el = el;
    this.map = null;
    this.infoOverlay = null;
    this.data = data;
  }

  // ---

  highlightFeature(layer) {
    console.log('[hover]', layer);

    layer.setStyle({
      opacity: 0.7,
      fillOpacity: 0.3,
    });

    if (!Browser.ie && !Browser.opera && !Browser.edge) {
      layer.bringToFront();
    }

    this.infoOverlay.update(layer.feature.properties);
  }

  resetHighlight(layer) {
    console.log('[leave]', layer);

    layer.setStyle({
      opacity: 0,
      fillOpacity: 0,
    });

    this.infoOverlay.update();
  }

  zoomToFeature(layer) {
    console.log('CLICK', layer.getBounds());
    this.map.fitBounds(layer.getBounds());
  }

  buildMarkerIcon() {
    let className = (this.data.marker.rotation == 90 || this.data.marker.rotation == 270)
      ? `rotate${this.data.marker.rotation}`
      : ''

    return divIcon({
      className: 'customMarker',
      iconSize: [30, 39],
      iconAnchor: [15, 39],
      html: `
        <div class="${className}">
          <div class="animate">
            <img src="/client/images/marker_30.png">
          </div>
        </div>
       `
    })
  }

  build() {
    console.log('[debug] Build map')

    // Note: Coordinates in CRS.Simple take the form of [y, x] instead of [x, y]
    const bounds = [
      [0, 0],
      [this.data.image.height, this.data.image.width]
    ]

    // Create empty Leaflet map
    this.map = new LeafletMap(this.el, {
      crs: CRS.Simple,
      minZoom: -1,
      maxBounds: bounds,
      maxBoundsViscosity: 0.8,
      minZoom: -2,
      maxZoom: 2,
    });

    this.infoOverlay = new LeafletControl();
    this.infoOverlay.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
    this.infoOverlay.update = function (props) {
      if (!props) {
        this._div.style.display = 'none';
        this._div.innerHTML = '';
        return;
      }
      this._div.style.display = 'block';
      this._div.innerHTML = props.name
    };
    this.infoOverlay.addTo(this.map);

    // Add background image
    imageOverlay(
      this.data.image.src,
      bounds
    ).addTo(this.map);

    // Add marker
    marker(
      [ this.data.marker.y, this.data.marker.x ],
      {icon: this.buildMarkerIcon()}
    ).addTo(this.map);

    // Add overlays
    geoJSON(geoJsonData, {
      style: (feature) => ({
        opacity: 0,
        fillOpacity: 0,
        weight: 3,
        color: feature.properties.color
      }),
      onEachFeature: (feature, layer) => {

        layer.on({
          mouseover: () => this.highlightFeature(layer),
          mouseout: () => this.resetHighlight(layer),
          click: () => this.zoomToFeature(layer),
        });

        // Add a slightly larger click catcher
        layer.getLatLngs().map(polygonData => {

          let points = polygonData[0].map(x => [x.lng, x.lat]);
          points.push(points[0]); // Close polygon
          let poly = turfPolygon([points])
          let centerPoint = center(poly)
          console.log(centerPoint.geometry.coordinates)
          centerPoint = new LatLng(centerPoint.geometry.coordinates[1], centerPoint.geometry.coordinates[0])

          //debugger;
          // circle(centerPoint, {radius: 15, color: 'blue'}).addTo(this.map)

          let npoints = polygonData[0].map(x => x.clone());
          npoints.forEach(x => {
            let margin = 42;
            x.lat = (x.lat > centerPoint.lat) ? x.lat + margin : x.lat - margin
            x.lng = (x.lng > centerPoint.lng) ? x.lng + margin : x.lng - margin
          });

          polygon(npoints, {
            color: 'green',
            weight: 0,
            fillOpacity: 0.1,
          })
            .addTo(this.map)
            .on({
              mouseover: () => this.highlightFeature(layer),
              mouseout: () => this.resetHighlight(layer),
              click: () => this.zoomToFeature(layer),
            })
            .bindPopup(layer.feature.properties.name);

        });

        // let latlngs = flattenDeep(layer.getLatLngs());
        // let points = latlngs.map(x => [x.lng, x.lat]);

        // let concaveHull = concaveman(points, 1, 0);
        // console.log(concaveHull)

        // console.log(concaveHull);

        // let hullLatLngs = concaveHull.map(x => new LatLng(x[1], x[0]))

        // let hull = polygon( hullLatLngs , { 
        //   color: 'blue',
        //   opacity: 0,
        //   fillOpacity: 0.2,
        // }).addTo(this.map);
        // hull.on({
        //   mouseover: () => this.highlightFeature(layer),
        //   mouseout: () => this.resetHighlight(layer),
        //   click: () => this.zoomToFeature(layer),
        // });
        // console.log(hull);

        //points = points.features.map(point => point.geometry.coordinates)
        // console.log(points);


        // polygon(concaveHull, { color: 'blue' }).addTo(this.map);

        // debugger;

        /*let hull = turf.convex(points);
        console.log(hull);
        hull.id = feature.id + '-hull';
        console.log('[onEachFeature]', hull);
        geoJSON(hull, {
          style: (feature) => ({
            opacity: 0.2,
            fillOpacity: 0.2,
          }),
          onEachFeature: (hullFeature, hullLayer) => {
            hullLayer.on({
              mouseover: () => this.highlightFeature(layer),
              mouseout: () => this.resetHighlight(layer),
              click: () => this.zoomToFeature(layer),
            });
          }
        })
        .bindPopup(hullLayer => {
          return layer.feature.properties.name;
        })
        .addTo(this.map);
        */
      }
    })
    .addTo(this.map);

    // Add event bindings
    this.map.on('mousemove', (ev) => {
      let el = document.getElementById('debug')
      if (el) {
        el.innerHTML = `x (lng): ${ev.latlng.lng}, y (lat): ${ev.latlng.lat}`;
      }
    })

    // Set view
    this.map.setView( [this.data.marker.y, this.data.marker.x], -1)

    return this
  }
}
