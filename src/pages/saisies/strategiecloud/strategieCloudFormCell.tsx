import {
    FormControlLabel,
    Radio,
    RadioGroup,
    Box,
    Checkbox,
    Chip,
    ListItemText,
    ListSubheader,
    MenuItem
} from "@mui/material";
import {
    type ControllerFieldState,
    type ControllerRenderProps,
    type UseFormStateReturn
} from "react-hook-form";
import ConstructionIcon from "@mui/icons-material/Construction";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudIcon from "@mui/icons-material/Cloud";
import DnsIcon from "@mui/icons-material/Dns";
import SettingsIcon from "@mui/icons-material/Settings";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import type { DemandeCreationStrategieCloud, ModsIndicateur } from "models/indicateurs";
import SelectLayoutAppOrMod from "components/formsPageLayout/SelectLayoutAppOrMod";

type Field = {
    field: ControllerRenderProps<
        DemandeCreationStrategieCloud,
        "idsModule" | "strategieCloud" | "envCibleProd" | "commentaire"
    >;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<DemandeCreationStrategieCloud>;
};

export function RenderModuleSelection(field: Field, modules: ModsIndicateur[]) {
    const selected = Array.isArray(field.field.value) ? field.field.value : [];
    const validModules = modules.filter(
        (mod): mod is ModsIndicateur & { id: number } => mod.id !== undefined && mod.id !== null
    );
    const allIds = validModules.map(mod => mod.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selected.includes(id));
    const labelId: string = "Modules";
    const selectId: string = `module-select-${selected}`;

    const duplicatesMap = validModules.reduce(
        (acc, mod) => {
            const key = `${mod.modName ?? ""}-${mod.appName ?? ""}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const getLabel = (mod: ModsIndicateur & { id: number }) => {
        const key = `${mod.modName ?? ""}-${mod.appName ?? ""}`;
        const isDuplicate = duplicatesMap[key] > 1;
        return isDuplicate
            ? `${mod.appName} / ${mod.modName} (${mod.id})`
            : `${mod.appName} / ${mod.modName}`;
    };

    const groupedModules = validModules
        .toSorted((a, b) => (a.appName ?? "").localeCompare(b.appName ?? ""))
        .reduce(
            (acc, mod) => {
                const group = mod.appName ?? "";
                if (!acc[group]) acc[group] = [];
                acc[group].push(mod);
                return acc;
            },
            {} as Record<string, (ModsIndicateur & { id: number })[]>
        );

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
                        const mod = validModules.find(m => m.id === id);
                        return <Chip key={id} label={mod ? getLabel(mod) : id} />;
                    })}
                </Box>
            )}
        >
            {Object.entries(groupedModules).map(([appName, mods]) => [
                <ListSubheader key={`header-${appName}`}>{appName}</ListSubheader>,
                ...mods.map(mod => (
                    <MenuItem key={mod.id} value={mod.id}>
                        <Checkbox checked={selected.includes(mod.id)} />
                        <ListItemText primary={getLabel(mod)} />
                    </MenuItem>
                ))
            ])}
        </SelectLayoutAppOrMod>
    );
}

export function RenderStrategieCloudSelection(field: Readonly<Field>) {
    return (
        <RadioGroup row value={field.field.value} onChange={e => field.field.onChange(e.target.value)}>
            <FormControlLabel
                value="A instruire"
                control={
                    <Radio checkedIcon={<ConstructionIcon sx={{ color: "#ff9800", fontSize: 20 }} />} />
                }
                label="À instruire"
                tabIndex={0}
            />
            <FormControlLabel
                value="En cours"
                control={
                    <Radio
                        checkedIcon={<HourglassEmptyIcon sx={{ color: "#2196f3", fontSize: 20 }} />}
                    />
                }
                label="En cours"
                tabIndex={0}
            />
            <FormControlLabel
                value="Validée"
                control={
                    <Radio checkedIcon={<CheckCircleIcon sx={{ color: "#4caf50", fontSize: 20 }} />} />
                }
                label="Validée"
                tabIndex={0}
            />
        </RadioGroup>
    );
}

export function RenderEnvCibleSelection(field: Readonly<Field>) {
    return (
        <RadioGroup row value={field.field.value} onChange={e => field.field.onChange(e.target.value)}>
            <FormControlLabel
                value="NonDefini"
                control={
                    <Radio checkedIcon={<QuestionMarkIcon sx={{ color: "#e53241", fontSize: 20 }} />} />
                }
                label="Non Defini"
                tabIndex={0}
            />
            <FormControlLabel
                value="Kube"
                control={<Radio checkedIcon={<CloudIcon sx={{ color: "#326ce5", fontSize: 20 }} />} />}
                label="Kube"
                tabIndex={0}
            />
            <FormControlLabel
                value="cloud externe"
                control={<Radio checkedIcon={<CloudIcon sx={{ color: "#01579b", fontSize: 20 }} />} />}
                label="Cloud externe"
                tabIndex={0}
            />
            <FormControlLabel
                value="VM"
                control={<Radio checkedIcon={<DnsIcon sx={{ color: "#607d8b", fontSize: 20 }} />} />}
                label="VM"
                tabIndex={0}
            />
            <FormControlLabel
                value="Autre"
                control={
                    <Radio checkedIcon={<SettingsIcon sx={{ color: "#9e9e9e", fontSize: 20 }} />} />
                }
                label="Autre"
                tabIndex={0}
            />
        </RadioGroup>
    );
}
