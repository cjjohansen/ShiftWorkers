<template>
  <div>
    <h1>Schedule</h1>
    <div class="schedule">
      <div class="schedule-toolbar">
        <a class="arrow" @click="movePreviousPeriodFast">&laquo;</a>
        <a class="arrow" @click="movePreviousPeriod">&lsaquo;</a>
        <span class="title" @click="moveThisPeriod">{{ toolbarTitle }}</span>
        <a class="arrow" @click="moveNextPeriod">&rsaquo;</a>
        <a class="arrow" @click="moveNextPeriodFast">&raquo;</a>
      </div>
      <div class="schedule-grid-header">
        <div
          class="schedule-grid-header-cell"
          v-for="(column, columnIndex) in scheduleColumns"
          :key="columnIndex"
        >
          {{ column.label }}
        </div>
      </div>
      <div class="schedule-grid-rows">
        <div
          class="schedule-grid-row"
          v-for="(worker, index) in workers"
          :key="index"
        >
          <div
            class="schedule-grid-row-cell"
            @click="createShift()"
            v-for="(cell, cellIndex) in scheduleColumns"
            :key="cellIndex"
          >
            <div v-if="cellIndex == 0">{{ worker.name }}</div>
            <div
              v-else-if="workerHasShiftOnDate(worker, shifts, cellIndex - 1)"
            >
              <ShiftTile
                :shiftData="
                  getShiftForWorkerOnDate(worker, shifts, cellIndex - 1)
                "
              />
            </div>
            <div v-else>
              <div class="cell-add">{{ ' + ' }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="schedule-grid-footer">
        <div
          class="weekday"
          v-for="(weekday, weekdayIndex) in scheduleColumns"
          :key="weekdayIndex"
        >
          {{ weekday.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as scheduleData from '../data/scheduledata';
import { workers } from '../data/workerdata';
import { shifts } from '../data/shiftdata';
//import { format, formatDistance, formatRelative, subDays } from 'date-fns';
import startOfWeek from 'date-fns/start_of_week';
import * as datefns from 'date-fns';
import ShiftTile from './ShiftTile.vue';

export default {
  name: 'WorkerSchedule',
  components: { ShiftTile },
  created() {
    this.moveThisPeriod(new Date(2019, 3, 9));
  },
  data() {
    return {
      scheduleData: scheduleData,
      workers,
      shifts,
      datesInPeriod: []
    };
  },
  computed: {
    toolbarTitle() {
      console.log('toolbar title', this.datesInPeriod[0]);
      return (
        'Toolbar ' +
        datefns.format(this.datesInPeriod[0], 'DD MMMM') +
        ' - ' +
        datefns.format(this.datesInPeriod[6], 'DD MMMM')
      );
    },
    // State for weekday header (no dependencies yet...)
    scheduleColumns() {
      return scheduleData.columnLabels.map((columnLabel, i) => {
        return {
          label: scheduleData.transformLabel(
            columnLabel,
            scheduleData.columnHeaderWordLength,
            scheduleData.weekdayCasing
          ),
          number: i + 1
        };
      });
    },

    header() {
      return {
        label: datefns.format(this.datesInPeriod[0], 'MMMM YYYY')
      };
    },
    firstDayInPeriod() {
      return this.datesInPeriod[0];
    }
  },
  methods: {
    workerHasShiftOnDate(worker, shifts, dateIndex) {
      let shift = this.getShiftForWorkerOnDate(worker, shifts, dateIndex);
      //      console.log('got shift: ', shift);
      const result = shift != undefined;
      //      console.log('worker has shift:', result);
      return result;
    },
    getShiftForWorkerOnDate(worker, shifts, dateIndex) {
      const date = this.datesInPeriod[dateIndex];
      let result = shifts.find(s => {
        const result =
          datefns.compareAsc(new Date(s.date), date) === 0 &&
          worker.Id == s.workerId;

        // console.log(s.workerId);
        // console.log(datefns.compareAsc(new Date(s.date), date) === 0);
        // console.log(date);
        // console.log(new Date(s.date));
        // console.log('---------------------------');
        if (result === true) {
          //      console.log('¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤ returned shift', s);
          return s;
        } else {
          //    console.log('#################### reached undefined ', result);
          return undefined;
        }
      });
      // console.log('result:', result);
      return result;
    },
    createShift() {
      console.log('create Shift');
    },
    moveThisPeriod(date) {
      console.log('date:', date);
      const firstDate = startOfWeek(date, { weekStartsOn: 1 });
      this.datesInPeriod = [];
      for (var i = 0; i <= 6; i++) {
        this.datesInPeriod[i] = datefns.addDays(firstDate, i);
      }
    },
    moveNextPeriod() {
      const newStartDate = datefns.addDays(this.datesInPeriod[0], 7);
      this.moveThisPeriod(newStartDate);
    },
    movePreviousPeriod() {
      const newStartDate = datefns.addDays(this.datesInPeriod[0], -7);
      this.moveThisPeriod(newStartDate);
    },
    moveNextPeriodFast() {
      const newStartDate = datefns.addDays(this.datesInPeriod[0], 14);
      this.moveThisPeriod(newStartDate);
    },
    movePreviousPeriodFast() {
      const newStartDate = datefns.addDays(this.datesInPeriod[0], -14);
      this.moveThisPeriod(newStartDate);
    }
  }
};
</script>

<style lang="sass" scoped>
$themeColor: #ff7a58;

$headerPadding: 0.5rem 1rem;
$headerBorderWidth: 1px;
$headerBorderStyle: solid;
$headerBorderColor: #aaaaaa;
$headerBackground: $themeColor;
$headerColor: white;

$weekdayPadding: 0.4rem 0;
$weekdayColor: #7a7a7a;
$weekdayBorderWidth: 1px;
$weekdayBorderStyle: solid;
$weekdayBorderColor: #aaaaaa;
$weekdayBackground: #eaeaea;

$dayColor: #3a3a3a;
$dayBorder: solid 1px #aaaaaa;
$dayBackgroundColor: white;
$dayWidth: 14.2857%;
$dayHeight: 50px;

$todayColor: white;
$todayBackgroundColor: $themeColor;

$cellBorderWidth: 3px;
$cellBorderStyle: solid;
$cellBorderColor: #0000ff;



$fontFamily: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;

*
  box-sizing: border-box;

#app
  font-family: $fontFamily
  padding: 20px



=pointer()
  cursor: pointer
  &:hover
    color: #dcdcdc

=cell-pointer()
  cursor: pointer
  &:hover
    color: #FF0000
    border-width: $cellBorderWidth
    border-style: $cellBorderStyle
    border-coloer: $cellBorderColor


.arrow
  +pointer
  padding: 0 0.4em 0.2em 0.4em
  font-size: 1.8rem
  font-weight: 500
  user-select: none
  flex-grow: 0

.title
  +pointer
  flex-grow: 1
  font-size: 1.2rem
  text-align: center

.schedule
  display: flex
  flex-direction: column


// toolbar-----------------------------------------------------------------------------
.schedule-toolbar
  display: flex
  justify-content: stretch
  align-items: center
  color: $headerColor
  padding: $headerPadding
  border-width: $headerBorderWidth
  border-style: $headerBorderStyle
  border-color: $headerBorderColor
  background-color: $headerBackground

.schedule-grid-header
  display: flex
  flex-direction: row

.schedule-grid-header-cell
  width: $dayWidth
  display: flex
  justify-content: center
  align-items: center
  padding: $weekdayPadding
  color: $weekdayColor
  border-width: $weekdayBorderWidth
  border-style: $weekdayBorderStyle
  border-color: $weekdayBorderColor
  background-color: $weekdayBackground

.schedule-grid-rows
   display: flex
   flex-direction: column

.schedule-grid-row
   display: flex
   flex-direction: row

.schedule-grid-row-cell
  +cell-pointer
  width: $dayWidth
  height: $dayHeight
  display: flex
  justify-content: center
  align-items: center
  color: $dayColor
  background-color: $dayBackgroundColor
  border: $dayBorder



.schedule-grid-footer
  display: flex
  flex-direction: row

.schedule-grid-header-cell
  width: $dayWidth
  display: flex
  justify-content: center
  align-items: center
  padding: $weekdayPadding
  color: $weekdayColor
  border-width: $weekdayBorderWidth
  border-style: $weekdayBorderStyle
  border-color: $weekdayBorderColor
  background-color: $weekdayBackground

//-----------------------------------------------------------------------------------------------------------

.columns
.weekdays
  display: flex
  flex: auto


.workercolumn
  width: $dayWidth
  display: flex
  justify-content: center
  align-items: center
  padding: $weekdayPadding
  color: $weekdayColor
  border-width: $weekdayBorderWidth
  border-style: $weekdayBorderStyle
  border-color: $weekdayBorderColor
  background-color: $weekdayBackground

.workerColumnHeader
.weekday
  width: $dayWidth
  display: flex
  justify-content: center
  align-items: center
  padding: $weekdayPadding
  color: $weekdayColor
  border-width: $weekdayBorderWidth
  border-style: $weekdayBorderStyle
  border-color: $weekdayBorderColor
  background-color: $weekdayBackground

.week
  display: flex

.day
  width: $dayWidth
  height: $dayHeight
  display: flex
  justify-content: center
  align-items: center
  color: $dayColor
  background-color: $dayBackgroundColor
  border: $dayBorder

.today
  font-weight: 500
  color: $todayColor
  background-color: $todayBackgroundColor






.row-cell
  width: $dayWidth
  height: $dayHeight
  display: flex
  justify-content: center
  align-items: center
  color: $dayColor
  background-color: $dayBackgroundColor
  border: $dayBorder

.cell-add
  border-width: 1px
  border-style: $cellBorderStyle
  border-color: $cellBorderColor
  border-radius: 30px
  padding: 0px 5px
</style>
