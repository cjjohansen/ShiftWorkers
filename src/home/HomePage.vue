<template>
  <div class="home">
    <WorkerSchedule></WorkerSchedule>
  </div>
</template>

<script>
import WorkerSchedule from '@/scheduling/WorkerSchedule.vue';

export default {
  name: 'HomePage',
  components: {
    WorkerSchedule
  },
  props: {
    msg: String
  },
  data() {
    return {
      attrs: [
        {
          key: 'today',
          highlight: {
            backgroundColor: '#ff8080'
            // Other properties are available too, like `height` & `borderRadius`
          },
          dates: new Date(2018, 0, 1)
        }
      ]
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home {
  text-align: center;
}
.robot {
  height: 300px;
}
.get-started {
  padding-top: 20px;
  font-size: 25px;
}
</style>
