import App from './components/App.js'

console.log('[debug] app.js')


// --------------------------------------------------------------------------------------------------v
// Entrypoint

console.log('[debug] new App')
const app = (new App('#app')).build();
