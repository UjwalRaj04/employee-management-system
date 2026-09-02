const { get } = require("mongoose");

const getBusinessYear = (date = new Date()) => {
    const currentDate = new Date(Date);

    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    const startYear = month < 3 ? year - 1 : year;

    const endYear=startYear+1;

    return `${startYear}/${String(endYear).slice(-2)}`
};

module.exports=getBusinessYear;
console.log(getBusinessYear("2026-03-31"));