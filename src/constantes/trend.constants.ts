import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import SouthEastIcon from "@mui/icons-material/SouthEast";

export const TREND_CONFIG = {
    up: {
        icon: NorthEastIcon,
        color: "success.main"
    },
    down: {
        icon: SouthEastIcon,
        color: "error.main"
    },
    flat: {
        icon: ArrowForwardIcon,
        color: "#c7c7c7"
    }
} as const;
