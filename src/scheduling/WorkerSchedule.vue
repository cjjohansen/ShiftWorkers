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
            <div v-else-if="workerHasShiftOnDate(worker, shifts, cellIndex)">
              <ShiftTile
                :shiftData="getShiftForWorkerOnDate(worker, shifts, cellIndex)"
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
          v-for="(weekday, weekdayIndex) in weekdays"
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
    this.date = new Date(2019, 3, 9);
    console.log('this date:', this.date);
    this.moveThisPeriod(this.date);
  },

  data() {
    return {
      scheduleData: scheduleData,
      date: 0,
      period: {},
      year: 0,
      month: 0,
      workers,
      shifts
    };
  },
  computed: {
    toolbarTitle() {
      return (
        'Toolbar ' +
        datefns.format(this.period.from, 'DD MMMM') +
        ' - ' +
        datefns.format(this.period.to, 'DD MMMM')
      );
    },
    // Our component exposes month as 1-based, but sometimes we need 0-based
    monthIndex() {
      console.log(' inside monthIndex ', this.month);
      return this.month - 1;
    },
    // State referenced by header (no dependencies yet...)
    months() {
      return scheduleData.monthLabels.map((ml, i) => ({
        label: scheduleData.transformLabel(
          ml,
          scheduleData.monthLength,
          scheduleData.monthCasing
        ),
        number: i + 1
      }));
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

    weekdays() {
      return scheduleData.columnLabels.map((wl, i) => {
        return {
          label: scheduleData.transformLabel(
            wl,
            scheduleData.columnHeaderWordLength,
            scheduleData.weekdayCasing
          ),
          number: i + 1
        };
      });
    },
    // State for calendar header
    header() {
      console.log('year: ', this.year);

      console.log('monthIndex ', this.monthIndex);
      const month = this.months[this.monthIndex];
      return {
        month,
        year: this.year.toString(),
        shortYear: this.year.toString().substring(2, 4),
        label: month.label + ' ' + this.year
      };
    },
    firstDayInPeriod() {
      console.log('date', this.date);
      return startOfWeek(this.date, { weekStartsOn: 1 });
    },
    // Returns number for first weekday (1-7), starting from Sunday
    firstWeekdayInMonth() {
      return new Date(this.year, this.monthIndex, 1).getDay() + 1;
    },
    // Returns number of days in the current month
    daysInMonth() {
      // Check for February in a leap year
      const isFebruary = this.month === 2;
      const isLeapYear =
        (this.year % 4 == 0 && this.year % 100 != 0) || this.year % 400 == 0;
      if (isFebruary && isLeapYear) return 29;
      // ...Just a normal month
      return scheduleData.daysInMonths[this.monthIndex];
    },
    weeks() {
      const weeks = [];
      let monthStarted = false,
        monthEnded = false;
      let monthDay = 0;
      // Cycle through each week of the month, up to 6 total
      for (let w = 1; w <= 6 && !monthEnded; w++) {
        // Cycle through each weekday
        const week = [];
        for (let d = 1; d <= 7; d++) {
          // We need to know when to start counting actual month days
          if (!monthStarted && d >= this.firstWeekdayInMonth) {
            // Initialize day counter
            monthDay = 1;
            // ...and flag we're tracking actual month days
            monthStarted = true;
            // Still in the middle of the month (hasn't ended yet)
          } else if (monthStarted && !monthEnded) {
            // Increment the day counter
            monthDay += 1;
          }
          // Append day info for the current week
          // Note: this might or might not be an actual month day
          //  We don't know how the UI wants to display various days,
          //  so we'll supply all the data we can
          week.push({
            label: monthDay ? monthDay.toString() : '',
            number: monthDay,
            weekdayNumber: d,
            weekNumber: w,
            beforeMonth: !monthStarted,
            afterMonth: monthEnded,
            inMonth: monthStarted && !monthEnded,
            isToday:
              monthDay === scheduleData.todayComps.day &&
              this.month === scheduleData.todayComps.month &&
              this.year === scheduleData.todayComps.year,
            isFirstDay: monthDay === 1,
            isLastDay: monthDay === this.daysInMonth
          });

          // Trigger end of month on the last day
          if (monthStarted && !monthEnded && monthDay >= this.daysInMonth) {
            monthDay = 0;
            monthEnded = true;
          }
        }
        // Append week info for the month
        weeks.push(week);
      }
      return weeks;
    }
    // End of computed properties
  },

  methods: {
    workerHasShiftOnDate(worker, shifts, dayInPeriodIndex) {
      let shift = this.getShiftForWorkerOnDate(
        worker,
        shifts,
        dayInPeriodIndex
      );
      console.log('got shift: ', shift);
      const result = shift != undefined;
      console.log('worker has shift:', result);
      return result;
    },
    getShiftForWorkerOnDate(worker, shifts, dayInPeriodIndex) {
      let result = shifts.find(s => {
        const firstDate = this.firstDayInPeriod;
        const currentDate = datefns.addDays(firstDate, dayInPeriodIndex);
        const result =
          datefns.compareAsc(new Date(s.date), currentDate) === 0 &&
          worker.Id == s.workerId;
        console.log(worker);
        console.log(s.workerId);
        console.log(datefns.compareAsc(new Date(s.date), currentDate) === 0);
        console.log(currentDate);
        console.log(new Date(s.date));
        console.log('---------------------------');
        if (result === true) {
          console.log('¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤ returned shift', s);
          return s;
        } else {
          console.log('#################### reached undefined ', result);
          return undefined;
        }
      });
      console.log('result:', result);
      return result;
    },
    createShift() {
      console.log('create Shift');
    },
    moveThisPeriod(date) {
      this.startDay = startOfWeek(date, { weekStartsOn: 1 });
      this.period.from = this.firstDayInPeriod;
      this.period.to = datefns.addDays(this.period.from, 6);
      this.month = scheduleData.todayComps.month;
      this.year = scheduleData.todayComps.year;
    },
    moveNextPeriod() {
      console.log('moveNextPeriod', this.month);
      console.log('monthIndex ', this.monthIndex);
      if (this.month < 12) {
        this.month++;
      } else {
        this.month = 1;
        this.year++;
      }
    },
    movePreviousPeriod() {
      if (this.month > 1) {
        this.month--;
      } else {
        this.month = 12;
        this.year--;
      }
    },
    moveNextPeriodFast() {
      this.year++;
    },
    movePreviousPeriodFast() {
      this.year--;
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
