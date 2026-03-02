/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormControlLabel, Radio, RadioGroup, Autocomplete, TextField } from "@mui/material";
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
import type { DemandeCreationStrategieCloud, ModsIndicateur } from "models/indicateurs";

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

    const strictFilterOptions = (options: ModsIndicateur[], state: { inputValue: string }) => {
        const inputValue = state.inputValue.trim().toLowerCase();
        if (inputValue === "") {
            return options;
        }
        return options.filter(
            option =>
                (option.modName ?? "").toLowerCase().includes(inputValue) ||
                (option.appName ?? "").toLowerCase().includes(inputValue)
        );
    };

    return (
        <Autocomplete<ModsIndicateur, true, false, false>
            multiple
            id="modules-autocomplete"
            options={validModules}
            getOptionLabel={option => `${option.modName ?? ""} (${option.appName}) (${option.id})`}
            filterOptions={strictFilterOptions}
            filterSelectedOptions
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={validModules.filter(mod => selected.includes(mod.id ?? 0))}
            onChange={(_: any, newValue: ModsIndicateur[]) => {
                field.field.onChange(newValue.map(mod => mod.id ?? 0));
            }}
            renderInput={params => (
                <TextField {...params} label="Modules" placeholder="Rechercher des modules..." />
            )}
            sx={{ width: "100%" }}
        />
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
