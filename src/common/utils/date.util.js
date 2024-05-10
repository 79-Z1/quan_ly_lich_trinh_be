const dayjs = require('dayjs');

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
    const normalizedDate1 = dayjs(date1);
    const normalizedDate2 = dayjs(date2);

    const time1 = normalizedDate1.format('HH:mm:ss');
    const time2 = normalizedDate2.format('HH:mm:ss');
    const now = dayjs().format('HH:mm:ss');
    if (now > time1 && now < time2) {
        return 'in_progress';
    } else if (now >= time2) {
        return 'done';
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