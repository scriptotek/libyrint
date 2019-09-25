<template>
  <div class="container p-3">
    <h3>
      <router-link :to="{ name: 'home' }">
        Libyrint-editor
      </router-link>
    </h3>
    <LibrarySelector />
  </div>
</template>

<script>
import LibrarySelector from './LibrarySelector'
export default {
  name: 'Home',
  components: {
    LibrarySelector,
  },
}
</script>
