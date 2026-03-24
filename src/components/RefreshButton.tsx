import { IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useState } from "react";

interface RefreshButtonProps {
    refetch: () => Promise<unknown>;
    disabled: boolean;
}

export default function RefreshButton({ refetch, disabled }: Readonly<RefreshButtonProps>) {
    const [spinning, setSpinning] = useState<boolean>(false);

    const handleClick = async (): Promise<void> => {
        if (disabled || spinning) return;
        setSpinning(true);
        await refetch();
        setSpinning(false);
    };

    return (
        <IconButton
            onClick={handleClick}
            disabled={disabled || spinning}
            aria-label="Rafraîchir"
            color="secondary"
            size="small"
            sx={{
                border: "1px solid",
                borderColor: "secondary.main",
                transition: "background 0.15s",
                "&:disabled": {
                    borderColor: "action.disabled"
                },
                "& svg": {
                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: spinning ? "rotate(360deg)" : "rotate(0deg)"
                }
            }}
        >
            <RefreshIcon fontSize="medium" />
        </IconButton>
    );
}
