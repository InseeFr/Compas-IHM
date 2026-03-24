import {
    Box,
    Checkbox,
    Chip,
    FormControlLabel,
    ListItemText,
    MenuItem,
    Radio,
    RadioGroup
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
import SelectLayoutAppOrMod from "components/formsPageLayout/SelectLayoutAppOrMod";

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

    const validApps = apps.filter(
        (app): app is Application & { idApplication: number } =>
            app.idApplication !== undefined && app.idApplication !== null
    );

    const allIds = validApps.map(app => app.idApplication);

    const allSelected = allIds.length > 0 && allIds.every(id => selected.includes(id));
    const labelId: string = "Applications";
    const selectId: string = `app-select-${selected}`;

    return (
        <SelectLayoutAppOrMod<number>
            id={selectId}
            labelId={labelId}
            selected={selected}
            allIds={allIds}
            allSelected={allSelected}
            onChange={value => field.field.onChange(value)}
            renderValue={selected => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map(id => {
                        const app = validApps.find(a => a.idApplication === id);
                        return <Chip key={id} label={app?.appName ?? id} />;
                    })}
                </Box>
            )}
        >
            {validApps.map(app => (
                <MenuItem key={app.idApplication} value={app.idApplication}>
                    <Checkbox checked={selected.includes(app.idApplication)} />
                    <ListItemText primary={app.appName} />
                </MenuItem>
            ))}
        </SelectLayoutAppOrMod>
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
                tabIndex={0}
            />
            <FormControlLabel
                value={3}
                control={
                    <Radio checkedIcon={<WbCloudyIcon sx={{ color: "#757575", fontSize: 20 }} />} />
                }
                label="Nuage"
                tabIndex={0}
            />
            <FormControlLabel
                value={2}
                control={
                    <Radio
                        checkedIcon={<WaterDropTwoToneIcon sx={{ color: "#0288d1", fontSize: 20 }} />}
                    />
                }
                tabIndex={0}
                label="Pluie"
            />
            <FormControlLabel
                value={1}
                control={
                    <Radio
                        checkedIcon={
                            <ThunderstormIcon sx={{ color: "rgb(179, 173, 92)", fontSize: 20 }} />
                        }
                    />
                }
                tabIndex={0}
                label="Orage"
            />
        </RadioGroup>
    );
}
