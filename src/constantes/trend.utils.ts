export type Trend = "up" | "down" | "flat";

export const getTrend = (value?: number): Trend => {
    if (!value) return "flat";
    if (value > 0) return "up";
    if (value < 0) return "down";
    return "flat";
};
