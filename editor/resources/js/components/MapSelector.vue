<template>
  <div>
    <div
      v-if="state === 'loading' || error"
      class="text-danger"
    >
      {{ error }}
    </div>
    <div
      v-else
      class="card my-3"
    >
      <h5 class="card-header">
        {{ library.name.nb }}
      </h5>

      <ul class="list-group list-group-flush">
        <router-link
          v-for="map in maps"
          :key="map.id"
          :to="{ name: 'map', params: {map: map.id}}"
          class="list-group-item list-group-item-action"
        >
          {{ map.name }}
        </router-link>

        <li
          v-if="saveError"
          class="list-group-item list-group-item-danger"
        >
          {{ saveError }}
        </li>
        <li class="list-group-item">
          <form
            class="d-flex"
            @submit.prevent="submit"
          >
            <input
              v-model="newMapName"
              type="text"
              class="form-control mr-3"
            >
            <button class="btn btn-success flex-shrink-0">
              Opprett nytt kart
            </button>
          </form>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import uuidv4 from 'uuid/v4'
import Api from '../api.js'
export default {

  name: 'MapSelector',

  props: {
    library: {
      type: Object,
      default: () => null,
    },
  },

  data () {
    return {
      error: null,
      saveError: null,
      state: 'loading',
      maps: [],
      newMapName: '',
    }
  },

  async mounted () {
    try {
      this.maps = (await Api.listMaps({ library: this.library.id })).maps
      this.state = 'ready'
    } catch (err) {
      console.error(err)
      this.error = err
    }
  },

  methods: {
    onChange () {

    },
    openMap (id) {
      this.$router.push({ name: 'map', params: { map: id } })
    },
    submit () {
      const newMap = {
        id: uuidv4(),
        library_id: this.library.id,
        name: this.newMapName,
        body: {},
      }
      this.state = 'saving'
      this.saveError = null
      Api.storeMap(newMap)
        .then(res => this.openMap(res.map.id))
        .catch(err => {
          this.saveError = err
        })
        .then(() => {
          this.state = 'ready'
        })
    },
  },
}
</script>

<style lang="css" scoped>
</style>
