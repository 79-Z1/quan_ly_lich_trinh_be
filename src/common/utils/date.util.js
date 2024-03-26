const dayjs = require('dayjs');

const compareDays = (date1, date2) => {
    const normalizedDate1 = dayjs(date1).startOf('day');
    const normalizedDate2 = dayjs(date2).startOf('day');

    return normalizedDate1.isSame(normalizedDate2, 'day');
}

module.exports = {
    compareDays
}