import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'; // ou RemoveIcon

export const TREND_CONFIG = {
    up: {
        icon: ThumbUpIcon,
        color: "success.main"
    },
    down: {
        icon: ThumbDownIcon,
        color: "error.main"
    },
    flat: {
        icon: HorizontalRuleIcon, // ou RemoveIcon
        color: "#c7c7c7"
    }
} as const;
