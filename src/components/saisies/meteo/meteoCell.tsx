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

const ALL: string = "__all__";

export function RenderAppSelections(field: Field, apps: Application[]) {
    const selected = Array.isArray(field.field.value) ? field.field.value : [];

    const validApps = apps.filter(
        (app): app is Application & { idApplication: number } =>
            app.idApplication !== undefined && app.idApplication !== null
    );

    const allIds = validApps.map(app => app.idApplication);

    const allSelected = allIds.length > 0 && allIds.every(id => selected.includes(id));

    return (
        <Select
            multiple
            value={selected}
            onChange={e => {
                const value = e.target.value as (number | string)[];
                if (value.includes(ALL)) {
                    field.field.onChange(allSelected ? [] : allIds);
                } else {
                    field.field.onChange(value as number[]);
                }
            }}
            renderValue={selected => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map(id => {
                        const app = validApps.find(a => a.idApplication === id);
                        return <Chip key={id} label={app?.appName ?? id} />;
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
            <MenuItem value={ALL}>
                <Checkbox checked={allSelected} indeterminate={selected.length > 0 && !allSelected} />
                <ListItemText primary="Tout sélectionner" />
            </MenuItem>

            {validApps.map(app => (
                <MenuItem key={app.idApplication} value={app.idApplication}>
                    <Checkbox checked={selected.includes(app.idApplication)} />
                    <ListItemText primary={app.appName} />
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
                control={<Radio checkedIcon={<WbSunnyIcon sx={{ color: "#fbc02d", fontSize: 20 }} />} />}
                label="Soleil"
            />
            <FormControlLabel
                value={3}
                control={
                    <Radio checkedIcon={<WbCloudyIcon sx={{ color: "#757575", fontSize: 20 }} />} />
                }
                label="Nuage"
            />
            <FormControlLabel
                value={2}
                control={
                    <Radio
                        checkedIcon={<WaterDropTwoToneIcon sx={{ color: "#0288d1", fontSize: 20 }} />}
                    />
                }
                label="Pluie"
            />
            <FormControlLabel
                value={1}
                control={
                    <Radio
                        checkedIcon={<ThunderstormIcon sx={{ color: "#0c0d0eff", fontSize: 20 }} />}
                    />
                }
                label="Orage"
            />
        </RadioGroup>
    );
}
