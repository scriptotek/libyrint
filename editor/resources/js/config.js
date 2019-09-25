
/** @type {string} */
export const BASE_PATH = process.env.MIX_BASE_PATH.replace(/\/+$/, '') + '/'

/** @type {string} */
export const API_BASE_URL = process.env.MIX_API_BASE_URL.replace(/\/+$/, '') + '/'

/** @type {string} */
export const IMAGE_BASE_URL = API_BASE_URL + 'images/'

/**
 * @typedef {Object<string, any>} FeatureType
 * @property {string} key
 * @property {string} label
 * @property {string} class
 * @property {string} collectionLabel
 * @property {string} collectionClass
 * @property {object} style
 */

/** @type {FeatureType} */
export const roomType = {
  key: 'rooms',
  label: 'Område',
  class: 'Room',
  collectionLabel: 'Områder',
  collectionClass: 'RoomCollection',
  style: {
    default: {
      color: 'blue',
      weight: 1,
      dashArray: null,
    },
    selected: {
      color: 'magenta',
      weight: 2,
      dashArray: '3 4',
    },
  },
}

/** @type {FeatureType} */
export const collectionType = {
  key: 'collections',
  label: 'Samling',
  class: 'Collection',
  collectionLabel: 'Samlinger',
  collectionClass: 'CollectionCollection',
  style: {
    default: {
      color: 'blue',
      weight: 1,
      dashArray: null,
    },
    selected: {
      color: 'magenta',
      weight: 2,
      dashArray: '3 4',
    },
  },
}

/** @type {FeatureType} */
export const markerType = {
  key: 'markers',
  label: 'Punkt',
  class: 'Marker',
  collectionLabel: 'Punkter',
  collectionClass: 'MarkerCollection',
  style: {
    default: {
    },
    selected: {
    },
  },
}

/** @type {FeatureType[]} */
export const featureTypes = [
  roomType,
  collectionType,
  markerType,
]

/**
 * @typedef {Object<string, any>} ShelvingScheme
 * @property {string} id
 * @property {string} label
 */

/**
 * @type {ShelvingScheme[]}
 */
export const shelvingSchemes = [
  {
    id: 'dewey',
    label: 'DDC',
  },
  {
    id: 'udc',
    label: 'UDC',
  },
  {
    id: 'msc',
    label: 'MSC',
  },
  {
    id: 'ureal_astr',
    label: 'UREAL Astr.',
  },
  {
    id: 'ureal_fys',
    label: 'UREAL Fys.',
  },
  {
    id: 'ureal_kjem',
    label: 'UREAL Kjem.',
  },
  {
    id: 'ureal_biol',
    label: 'UREAL Biol.',
  },
  {
    id: 'ureal_samling42',
    label: 'UREAL Samling 42',
  },
  {
    id: 'ureal_scifi',
    label: 'UREAL SciFi',
  },
]
