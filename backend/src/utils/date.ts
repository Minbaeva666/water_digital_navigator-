import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export function parseOrToday(input?: string | null): Date {
    // 1) Strikt "DD.MM.YYYY"
    if (typeof input === "string") {
        const dDMY = dayjs(input, "DD.MM.YYYY", true);
        if (dDMY.isValid()) {
            return dDMY.hour(12).minute(0).second(0).millisecond(0).toDate();
        }

        // 2) Fallback: ISO/sonst parsbar
        const dAny = dayjs(input);
        if (dAny.isValid()) {
            return dAny.hour(12).minute(0).second(0).millisecond(0).toDate();
        }
    }

    // 3) Letzter Fallback: heute (lokal)
    return dayjs().hour(12).minute(0).second(0).millisecond(0).toDate();
}