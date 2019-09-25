<template>
  <div>
    <div
      v-if="!loaded || error"
      class="text-danger"
    >
      {{ error }}
    </div>
    <div v-else>
      <div class="card my-3">
        <h5 class="card-header">
          Velg bibliotek
        </h5>
        <div class="card-body">
          <select
            v-model="selectedLibrary"
            class="custom-select"
          >
            <option :value="null">
              (Velg fra lista)
            </option>
            <option
              v-for="library in libraries"
              :key="library.id"
              :value="library.id"
            >
              {{ library.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="card my-3">
        <h5 class="card-header">
          … eller opprett et nytt
        </h5>
        <div class="card-body">
          <form
            class="form"
            @submit.prevent="submit"
          >
            <div class="form-group row">
              <label
                for="inputId"
                class="col-sm-2 col-form-label"
              >Bibliotekskode:</label>
              <div class="col-sm-10">
                <input
                  id="inputId"
                  v-model="newLibrary.id"
                  type="text"
                  class="form-control"
                  placeholder="F.eks. 1030310"
                >
              </div>
            </div>

            <div class="form-group row">
              <label
                for="inputNameNb"
                class="col-sm-2 col-form-label"
              >Norsk navn:</label>
              <div class="col-sm-10">
                <input
                  id="inputNameNb"
                  v-model="newLibrary.name.nb"
                  type="text"
                  class="form-control"
                  placeholder=""
                >
              </div>
            </div>

            <div class="form-group row">
              <label
                for="inputNameEn"
                class="col-sm-2 col-form-label"
              >Engelsk navn:</label>
              <div class="col-sm-10">
                <input
                  id="inputNameEn"
                  v-model="newLibrary.name.en"
                  type="text"
                  class="form-control"
                  placeholder=""
                >
              </div>
            </div>

            <div
              v-if="saveError"
              class="text-danger"
            >
              {{ saveError }}
            </div>

            <div class="form-group row">
              <div class="col-sm-10">
                <button
                  :disabled="state !== 'idle'"
                  type="submit"
                  class="btn btn-primary"
                >
                  Opprett
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Api from '../api.js'
export default {

  name: 'LibrarySelector',

  data () {
    return {
      loaded: false,
      error: null,
      state: 'loading',
      saveError: null,
      libraries: [],
      selectedLibrary: null,
      newLibrary: { id: '', name: { nb: '', en: '' } },
    }
  },

  watch: {
    selectedLibrary (newValue) {
      this.openLibrary(newValue)
    },
  },

  mounted () {
    Api.listLibraries()
      .then(data => {
        this.libraries = data.libraries
        this.state = 'idle'
      })
      .catch(err => {
        this.error = err
      })
      .then(() => {
        this.loaded = true
      })
  },

  methods: {
    openLibrary (id) {
      this.$router.push({ name: 'library', params: { library: id } })
    },
    submit () {
      this.state = 'saving'
      this.saveError = null
      Api.storeLibrary(this.newLibrary)
        .then(res => {
          this.openLibrary(res.library.id)
        })
        .catch(err => {
          this.saveError = err
        })
        .then(() => {
          this.state = 'idle'
        })
    },
  },
}
</script>

<style lang="css" scoped>
</style>
