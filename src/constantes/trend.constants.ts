import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export const TREND_CONFIG = {
    up: {
        icon: ArrowUpwardIcon,
        color: "success.main"
    },
    down: {
        icon: ArrowDownwardIcon,
        color: "error.main"
    },
    flat: {
        icon: ArrowForwardIcon,
        color: "text.secondary"
    }
} as const;
