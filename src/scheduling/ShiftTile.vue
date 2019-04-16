<template>
  <div class="shift-tile">
    <div class="shift-time">{{ shiftTime }}</div>
  </div>
</template>

<script>
//import * as datefns from 'date-fns';
export default {
  name: 'ShiftTile',
  props: ['shiftData'],
  computed: {
    shiftTime() {
      return this.shiftData.start + ' - ' + this.shiftData.end;
    }
  }
};
</script>

<style scoped lang="sass"></style>
