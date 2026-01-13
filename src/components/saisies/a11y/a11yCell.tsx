import {
    Box,
    Checkbox,
    Chip,
    FormControlLabel,
    FormLabel,
    ListItemText,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField
} from "@mui/material";
import type { ControllerFieldState, ControllerRenderProps, UseFormStateReturn } from "react-hook-form";
import ThumbDownAlt from "@mui/icons-material/ThumbDownAlt";
import ThumbUpAlt from "@mui/icons-material/ThumbUpAlt";
import type { Module } from "todos-api/client.gen";
import type { A11yFormValues } from "./a11yFormValues";

type Field<T extends keyof A11yFormValues> = {
    field: ControllerRenderProps<A11yFormValues, T>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<A11yFormValues>;
};

type RenderModuleSelectionsProps = Readonly<Field<"idsModule">> & {
    modules: Module[];
};

const toLocalDateString = (value?: string | Date): string => {
    if (!value) return "";
    if (value instanceof Date) {
        return value.toLocaleDateString("fr-CA"); // 'YYYY-MM-DD'
    }
    // Si c'est déjà une string ISO complète
    return value.split("T")[0];
};

export function RenderModuleSelections({ field, modules }: RenderModuleSelectionsProps) {
    const selected = field.value ?? [];

    return (
        <Select<number[]>
            multiple
            value={selected}
            onChange={e => field.onChange(e.target.value as number[])}
            renderValue={value => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {value.map(id => {
                        const mod = modules.find(m => m.id === id);
                        return <Chip key={id} label={mod?.modName ?? id} />;
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
            {modules.map(mod => (
                <MenuItem key={mod.id} value={mod.id}>
                    <Checkbox checked={selected.includes(mod.id!)} />
                    <ListItemText primary={mod.modName} />
                </MenuItem>
            ))}
        </Select>
    );
}

export function RenderDeclaration({ field }: Readonly<Field<"isDeclaration">>) {
    return (
        <>
            <FormLabel id="declaration-label">Déclaration d'accessibilité existante</FormLabel>
            <RadioGroup
                row
                aria-labelledby="declaration-label"
                value={field.value ? "true" : "false"}
                onChange={e => field.onChange(e.target.value === "true")}
            >
                <FormControlLabel
                    value="true"
                    control={<Radio checkedIcon={<ThumbUpAlt />} />}
                    label="Oui"
                />
                <FormControlLabel
                    value="false"
                    control={<Radio checkedIcon={<ThumbDownAlt />} />}
                    label="Non"
                />
            </RadioGroup>
        </>
    );
}

export function RenderDateDeclaration(field: Readonly<Field<"dateDeclaration">>) {
    return (
        <TextField
            label="Date de déclaration"
            type="date"
            value={toLocalDateString(field.field.value)}
            onChange={field.field.onChange}
            slotProps={{ inputLabel: { shrink: true } }}
        />
    );
}

export function RenderTypeAudit({ field }: Readonly<Field<"idIndicateurTypeAudit">>) {
    return (
        <>
            <FormLabel id="type-audit-label">Type d'audit</FormLabel>
            <Select
                labelId="type-audit-label"
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
            >
                <MenuItem value={510}>Aucun audit</MenuItem>
                <MenuItem value={511}>Audit partiel</MenuItem>
                <MenuItem value={512}>Audit complet</MenuItem>
                <MenuItem value={513}>Audit complet externe</MenuItem>
            </Select>
        </>
    );
}

export function RenderScoreAudit(scoreField: Readonly<Field<"scoreAudit">>) {
    return (
        <TextField
            label="Score Audit"
            type="number"
            value={scoreField.field.value ?? 0}
            onChange={e => {
                const value = e.target.value;
                scoreField.field.onChange(value === "" ? 0 : Number(value));
            }}
        />
    );
}

export function RenderDateAudit(dateAudit: Readonly<Field<"dateAudit">>) {
    return (
        <TextField
            label="Date Audit"
            type="date"
            value={toLocalDateString(dateAudit.field.value)}
            onChange={dateAudit.field.onChange}
            slotProps={{ inputLabel: { shrink: true } }}
        />
    );
}
