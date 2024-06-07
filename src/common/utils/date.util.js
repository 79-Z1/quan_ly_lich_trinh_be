const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
dayjs.extend(isBetween);

const compareDays = (date1, date2) => {
    const normalizedDate1 = dayjs(date1).startOf('day');
    const normalizedDate2 = dayjs(date2).startOf('day');

    return normalizedDate1.isSame(normalizedDate2, 'day');
}

const ltOrEqDays = (date1, date2) => {
    const normalizedDate1 = dayjs(date1).startOf('day');
    const normalizedDate2 = dayjs(date2).startOf('day');

    // Check if date1 is before or equal to date2, considering only the day
    return normalizedDate1.isSame(normalizedDate2, 'day') || normalizedDate1.isBefore(normalizedDate2, 'day');
}

const isLessThanDays = (date1, date2) => {
    const normalizedDate1 = dayjs(date1).startOf('day');
    const normalizedDate2 = dayjs(date2).startOf('day');

    // Check if date1 is before or equal to date2, considering only the day
    return normalizedDate1.isBefore(normalizedDate2, 'day');
}

const isGreaterThanDays = (date1, date2) => {
    const normalizedDate1 = dayjs(date1).startOf('day');
    const normalizedDate2 = dayjs(date2).startOf('day');

    // Check if date1 is before or equal to date2, considering only the day
    return normalizedDate1.isAfter(normalizedDate2, 'day');
}

const getStatusByTime = (date1, date2) => {
    console.log("🚀 ~ getStatusByTime ~ date1, date2:::", { date1, date2 });
    const now = dayjs();
    const normalizedDate1 = dayjs(date1);
    const normalizedDate2 = dayjs(date2);

    if (now.isBetween(normalizedDate1, normalizedDate2, 'second', '[)')) {
        return 'in_progress';
    } else if (now.isAfter(normalizedDate2)) {
        return 'done';
    } else {
        return 'in_coming';
    }
}

const formatVNDate = (date) => {
    return dayjs(date).format('YYYY-MM-DD');
};

module.exports = {
    compareDays,
    formatVNDate,
    ltOrEqDays,
    getStatusByTime,
    isLessThanDays,
    isGreaterThanDays
}