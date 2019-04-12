<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HomePage />
  </div>
</template>

<script>
// @ is an alias to /src
import HomePage from "@/home/HomePage.vue";

export default {
  name: "home",
  components: {
    HomePage
  }
};
</script>
