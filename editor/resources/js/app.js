import Vue from 'vue'
import VueRouter from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Home from './components/Home'
import LibraryHome from './components/LibraryHome'
import Editor from './components/Editor'
import { BASE_PATH } from './config'

Vue.config.devtools = true
Vue.config.productionTip = false

Vue.use(VueRouter)

library.add(faMinusCircle)

Vue.component('font-awesome-icon', FontAwesomeIcon)

const NotFound = { template: '<p>Page not found</p>' }

// --------------------------------------------------------------------------------------------------v
// Entrypoint

console.log('Initializing app')

const routes = [
  { name: 'home', path: '/', component: Home },
  { name: 'library', path: '/libraries/:library', component: LibraryHome },
  { name: 'map', path: '/maps/:map', component: Editor },
  { path: '*', component: NotFound },
]

const router = new VueRouter({
  base: BASE_PATH,
  routes,
})

const app = new Vue({
  router,
}).$mount('#app')

export default app
