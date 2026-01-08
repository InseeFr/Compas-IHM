import {
    Box,
    Checkbox,
    Chip,
    FormControlLabel,
    ListItemText,
    MenuItem,
    Radio,
    RadioGroup,
    Select
} from "@mui/material";
import {
    type ControllerFieldState,
    type ControllerRenderProps,
    type UseFormStateReturn
} from "react-hook-form";
import type { Application, DemandeCreationMeteo } from "todos-api/client.gen";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import WbCloudyIcon from "@mui/icons-material/WbCloudy";
import WaterDropTwoToneIcon from "@mui/icons-material/WaterDropTwoTone";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";

type Field = {
    field: ControllerRenderProps<
        DemandeCreationMeteo,
        `idsApplication.${number}` | "date" | "idsApplication" | "valeurMeteo" | "commentaire"
    >;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<DemandeCreationMeteo>;
};

export function RenderAppSelections(field: Field, apps: Application[]) {
    const selected = Array.isArray(field.field.value) ? field.field.value : [];
    return (
        <Select
            multiple
            value={selected}
            onChange={e => field.field.onChange(e.target.value)}
            renderValue={selected => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map(value => {
                        const app = apps.find(a => a.idApplication === value);
                        return <Chip key={value} label={app?.appName ?? value} />;
                    })}
                </Box>
            )}
            MenuProps={{
                PaperProps: {
                    style: {
                        maxHeight: 48 * 4.5 + 8,
                        width: 250
                    }
                }
            }}
        >
            {apps.map(option => (
                <MenuItem key={option.appName} value={option.idApplication}>
                    <Checkbox
                        checked={option.idApplication ? selected.includes(option.idApplication) : false}
                    />
                    <ListItemText primary={option.appName} />
                </MenuItem>
            ))}
        </Select>
    );
}

export function RenderMeteoSelection(field: Readonly<Field>) {
    return (
        <RadioGroup
            row
            value={field.field.value}
            onChange={e => field.field.onChange(Number(e.target.value))}
        >
            <FormControlLabel
                value={4}
                control={<Radio checkedIcon={<WbSunnyIcon />} />}
                label="Soleil"
            />
            <FormControlLabel
                value={3}
                control={<Radio checkedIcon={<WbCloudyIcon />} />}
                label="Nuage"
            />
            <FormControlLabel
                value={2}
                control={<Radio checkedIcon={<WaterDropTwoToneIcon />} />}
                label="Pluie"
            />
            <FormControlLabel
                value={1}
                control={<Radio checkedIcon={<ThunderstormIcon />} />}
                label="Orage"
            />
        </RadioGroup>
    );
}
