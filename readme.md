**libyrint** is a simple map system for locating items on book shelves organized by different kinds of classification and shelving schemes.
Made with Javascript using Vue and LeafletJS, and a small PHP-based API for map storage.

Why yet another map system? We had the following goals in mind for this:

- maps with integrated shelf navigation
- support for ordering by any kind of classification or shelving scheme, not just Dewey and UDC.
- should use data in a simple JSON format
- should work well on mobile
- should be possible to embed
- should have a not-too-horrible editing experience

Libyrint consists of four modules:

- **[api](./api)**: Provides a simple API to a storage for JSON map data and images.
  Goal: This module should do as little as possible, so that it can be swapped with a different API/storage if needed.
  We currently use PHP and SQLite3 for the storage API.

- **[client](./client)**: The user-facing client app. Reads data from the api.

- **[editor](./editor)**: Back-office editing app for maps. Reads and writes data to the api.

- **[shelvingschemes](./shelvingschemes)**: Back-office editor for classification and shelving schemes.
