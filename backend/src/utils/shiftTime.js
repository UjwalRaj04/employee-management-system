const LONDON = "Europe/London";

const WEEKDAY_MAP = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
}

const shiftsOverlap = (startA, endA, startB, endB) => {
    startA < endB && startB < endA;

    const parseHHMM = (value) => {
        if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
            throw new Error("Time must be in HH:MM format");
        }

        const hours = Number(value.slice(0, 2));
        const minutes = Number(value.slice(3, 5));


        if (hours > 23 || minutes > 59) {
            throw new Error("Time must be a valid HH:MM value");
        }
        return hours * 60 + minutes;
    };

    const formatHHMM = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60)
        const minutes=totalMinutes%60;
        return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;

    };
    const londonParts=(date)=>{
        const parts={};
        for(const part of new Intl.DateTimeFormat("en-GB",{
            timeZone:LONDON,
            weekday:"short",
            year:"numeric",
            month:"2-digit",
            day:"2-digit",
            hour:"2-digit",
            minute:"2-digit",
            hourCycle:"h23",
        }).formatToParts(date)){
            if(part.type !== "literal"){
                parts[part.type]=part.value;
            }
        }

        return parts;
    };
    const londonWeekday = (date) => WEEKDAY_MAP[londonParts(date).weekday];

const londonMinutes = (date) => {
    const parts = londonParts(date);
    return Number(parts.hour) * 60 + Number(parts.minute);
};

const londonDateKey = (date) => {
    const parts = londonParts(date);
    return `${parts.year}-${parts.month}-${parts.day}`;
};

const parseDateParam = (value, fieldName) => {
    if (!value) {
        throw new Error(`${fieldName} is required`);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error(`${fieldName} must be a valid date`);
    }

    return date;
};

const parseIsoDate = (value, fieldName) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
        throw new Error(`${fieldName} must be in YYYY-MM-DD format`);
    }

    return value;
};

const startOfLondonDayUtc = (yyyyMmDd) => {
    parseIsoDate(yyyyMmDd, "Date");
    const guess = new Date(`${yyyyMmDd}T00:00:00.000Z`);
    const minutes = londonMinutes(guess);
    return new Date(guess.getTime() - minutes * 60 * 1000);
};

const addDays = (yyyyMmDd, days) => {
    const date = new Date(`${yyyyMmDd}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
};

const mondayOfWeek = (yyyyMmDd) => {
    const date = new Date(`${yyyyMmDd}T12:00:00.000Z`);
    const weekday = date.getUTCDay();
    const offset = weekday === 0 ? -6 : 1 - weekday;
    return addDays(yyyyMmDd, offset);
};

const shiftSegments = (startTime, endTime) => {
    if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
        throw new Error("Shift times must be valid dates");
    }

    if (endTime <= startTime) {
        throw new Error("End time must be after start time");
    }

    const durationHours = (endTime - startTime) / (1000 * 60 * 60);

    if (durationHours > 24) {
        throw new Error("A shift cannot be longer than 24 hours");
    }

    const startDay = londonDateKey(startTime);
    const endDay = londonDateKey(endTime);
    const startMinutes = londonMinutes(startTime);
    const endMinutes = londonMinutes(endTime);

    if (startDay === endDay) {
        return [
            {
                dayOfWeek: londonWeekday(startTime),
                startMinutes,
                endMinutes,
            },
        ];
    }

    return [
        {
            dayOfWeek: londonWeekday(startTime),
            startMinutes,
            endMinutes: 24 * 60,
        },
        {
            dayOfWeek: londonWeekday(endTime),
            startMinutes: 0,
            endMinutes,
        },
    ];
};

const availabilityCoversShift = (slots, startTime, endTime) => {
    const byDay = new Map(
        slots.map((slot) => [Number(slot.dayOfWeek), slot])
    );

    for (const segment of shiftSegments(startTime, endTime)) {
        const slot = byDay.get(segment.dayOfWeek);

        if (!slot || slot.isAvailable === false) {
            return false;
        }

        const availableStart = parseHHMM(slot.startTime);
        const availableEnd = parseHHMM(slot.endTime);

        if (availableEnd <= availableStart) {
            return false;
        }

        if (
            segment.startMinutes < availableStart ||
            segment.endMinutes > availableEnd
        ) {
            return false;
        }
    }

    return true;
};

module.exports = {
    LONDON,
    shiftsOverlap,
    parseHHMM,
    formatHHMM,
    londonWeekday,
    londonMinutes,
    londonDateKey,
    parseDateParam,
    parseIsoDate,
    startOfLondonDayUtc,
    addDays,
    mondayOfWeek,
    shiftSegments,
    availabilityCoversShift,
};


}