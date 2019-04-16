// Calendar data
export const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const columnLabels = [
  'Worker',

  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];
export const columnHeaderWordLength = 6;
export const weekdayCasing = 'title';
export const monthLabels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
export const monthLength = 0;
export const monthCasing = 'title';

// Helper function for label transformation
export const transformLabel = (label, length, casing) => {
  label = length <= 0 ? label : label.substring(0, length);
  if (casing.toLowerCase() === 'lower') return label.toLowerCase();
  if (casing.toLowerCase() === 'upper') return label.toUpperCase();
  return label;
};

// Today's data
export const today = new Date();
export const todayComps = {
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  day: today.getDate()
};
