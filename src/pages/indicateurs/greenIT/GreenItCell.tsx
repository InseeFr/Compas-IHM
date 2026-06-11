import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import type { ViewMode } from "constantes/constantes";
import type { JSX } from "react";

interface IGreenItToggleProps {
    viewMode: ViewMode;
    setViewMode: (value: React.SetStateAction<ViewMode>) => void;
}

export const GreenItToggleButton = ({ viewMode, setViewMode }: IGreenItToggleProps): JSX.Element => {
    return (
        <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
            color="secondary"
        >
            <ToggleButton value="global">Global</ToggleButton>
            <ToggleButton value="prod">Prod</ToggleButton>
            <ToggleButton value="horsprod">Hors-prod</ToggleButton>
        </ToggleButtonGroup>
    );
};
