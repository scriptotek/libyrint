<template>
  <form
    enctype="multipart/form-data"
    @submit.prevent="submit"
  >
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span
          id="inputGroupFileAddon01"
          class="input-group-text"
        >Bakgrunnsbilde: </span>
      </div>
      <div
        v-if="error"
        class="text-danger"
      >
        {{ error }}
      </div>
      <div class="custom-file">
        <input
          id="inputGroupFile01"
          ref="file"
          type="file"
          accept="image/png,image/jpg,image/svg"
          class="custom-file-input"
          aria-describedby="inputGroupFileAddon01"
          @change="onChange"
        >
        <label
          ref="label"
          class="custom-file-label"
          for="inputGroupFile01"
        >Velg fil</label>
      </div>
    </div>
    <button
      type="submit"
      class="btn btn-success"
    >
      Last opp
    </button>
  </form>
</template>

<script>
import Api from '../api.js'
export default {
  name: 'BackgroundImageUploader',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data () {
    return {
      error: null,
      file: null,
    }
  },
  methods: {
    onChange (ev) {
      if (!this.$refs.file.files.length) {
        return
      }
      const file = this.$refs.file.files[0]
      this.file = file
      this.$refs.label.innerHTML = file.name
    },
    async submit () {
      const formData = new FormData()
      formData.append('id', this.data.id)
      formData.append('image', this.file)
      try {
        await Api.storeMapBackground(formData)
        this.$emit('uploaded')
      } catch (err) {
        this.error = err
      }
    },
  },
}
</script>
