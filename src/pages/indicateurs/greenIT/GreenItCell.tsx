import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ToolTipLayout } from "components/ToolTipLayout";
import { BYTES_PER_GB, type ViewMode } from "constantes/constantes";
import { TREND_CONFIG } from "constantes/trend.constants";
import type { Trend } from "constantes/trend.utils";
import type { GreenITIndicateur } from "models/indicateurs";
import type { JSX } from "react";
import { diffNumeric, formatNumberWithSpaces, formatOrNRWithUnit } from "./greenItConfig";

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

const getViewMode = (view: ViewMode, global: string, prod: string) => {
    if (view === "global") {
        const val = Math.round(Number(global));
        return Number.isNaN(val) ? "NR" : val;
    }
    if (view === "prod") {
        const val = Math.round(Number(prod));
        return Number.isNaN(val) ? "NR" : val;
    }
    const globalHist = Math.round(Number(global));
    const prodHist = Math.round(Number(prod));
    const non_prod = diffNumeric(String(globalHist), String(prodHist));
    return non_prod === null ? "NR" : Math.round(non_prod);
};

const isUpDownOrStable = (valueInitial: number, valuePast: number): Trend => {
    const roundedInitial = Math.round(valueInitial);
    const roundedPast = Math.round(valuePast);
    if (roundedInitial > roundedPast) return "down";
    if (roundedInitial < roundedPast) return "up";
    return "flat";
};

const getTrendDisplay = (sortValue: number | string | null | undefined, resultView: number | "NR") => {
    const isResultInvalid =
        resultView === "NR" || (typeof resultView === "number" && Number.isNaN(resultView));

    if (isResultInvalid || sortValue === null || sortValue === undefined || sortValue === "") {
        return { icon: null, color: "inherit" } as const;
    }

    return TREND_CONFIG[isUpDownOrStable(Math.round(Number(sortValue)), resultView)];
};

const displayOrNR = (sortValue: number | string | null | undefined) =>
    sortValue === null || sortValue === undefined || sortValue === "" ? "NR" : sortValue;

const toGBString = (raw: string): string => {
    const n = Number(raw);
    if (Number.isNaN(n)) return raw;
    return String(Math.round(n / BYTES_PER_GB));
};

const displayGB = (value: number | "NR") => (value === "NR" ? "NR" : formatNumberWithSpaces(value));

const cpuToHour = (value: number | "NR") => (value === "NR" ? "NR" : Math.round(value / 1000));
const cpuToHourKube = (value: number | "NR") => (value === "NR" ? "NR" : Math.round(value / 3600));

export function NbVMCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _nbVm, nbVMGlobalHist, nbVMProdHist } = row.original;
    const resultNbVmView = getViewMode(viewMode, nbVMGlobalHist, nbVMProdHist);
    const { icon: Icon, color } = getTrendDisplay(_nbVm, resultNbVmView);
    return (
        <ToolTipLayout
            title={`Nombre de VM : ${displayOrNR(_nbVm)} (${resultNbVmView === "NR" ? "NR" : formatOrNRWithUnit(resultNbVmView)})`}
            content={
                <div>
                    {displayOrNR(_nbVm)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}

export function NbPodCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _nbPodMaxiSort, nbPodMaxiHist, nbPodMaxiProdHist } = row.original;
    const resultNbPodView = getViewMode(viewMode, nbPodMaxiHist, nbPodMaxiProdHist);
    const { icon: Icon, color } = getTrendDisplay(_nbPodMaxiSort, resultNbPodView);
    return (
        <ToolTipLayout
            title={`Nombre de Pod : ${displayOrNR(_nbPodMaxiSort)} (${resultNbPodView})`}
            content={
                <div>
                    {displayOrNR(_nbPodMaxiSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}

export function DiskAllocatedCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _diskSort, diskAllocatedGlobalHist, diskAllocatedProdHist } = row.original;
    const resultDiskUsedView = getViewMode(viewMode, diskAllocatedGlobalHist, diskAllocatedProdHist);
    const { icon: Icon, color } = getTrendDisplay(_diskSort, resultDiskUsedView);
    return (
        <ToolTipLayout
            title={`Disque alloué : ${displayOrNR(_diskSort)} (${resultDiskUsedView})`}
            content={
                <div>
                    {displayOrNR(_diskSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}

export function DiskUsedCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _diskUsedSort, diskUsedHist, diskUsedProdHist } = row.original;
    const resultDiskUsedView = getViewMode(viewMode, diskUsedHist, diskUsedProdHist);
    const { icon: Icon, color } = getTrendDisplay(_diskUsedSort, resultDiskUsedView);
    return (
        <ToolTipLayout
            title={`Disque utilisé : ${displayOrNR(_diskUsedSort)} (${resultDiskUsedView})`}
            content={
                <div>
                    {displayOrNR(_diskUsedSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}

export function PvcUsedCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _pvcUsedSort, pvcUsedHist, pvcUsedProdHist } = row.original;
    const resultPvcUsedView = getViewMode(
        viewMode,
        toGBString(pvcUsedHist),
        toGBString(pvcUsedProdHist)
    );
    const { icon: Icon, color } = getTrendDisplay(_pvcUsedSort, resultPvcUsedView);
    return (
        <ToolTipLayout
            title={`Kube Stockage utilisé : ${displayOrNR(_pvcUsedSort)} (${resultPvcUsedView === "NR" ? "NR" : displayGB(resultPvcUsedView)})`}
            content={
                <div>
                    {displayOrNR(_pvcUsedSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}

export function S3UsedCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _s3UsedSort, s3UsedHist, s3UsedProdHist } = row.original;
    const resultS3UsedView = getViewMode(viewMode, toGBString(s3UsedHist), toGBString(s3UsedProdHist));
    const { icon: Icon, color } = getTrendDisplay(_s3UsedSort, resultS3UsedView);
    return (
        <ToolTipLayout
            title={`S3 utilisé : ${displayOrNR(_s3UsedSort)} (${resultS3UsedView === "NR" ? "NR" : displayGB(resultS3UsedView)})`}
            content={
                <div>
                    {displayOrNR(_s3UsedSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}

export function CPUCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _cpuSort, cpuAllocatedGlobalHist, cpuAllocatedProdHist } = row.original;
    const resultCpuView = cpuToHour(getViewMode(viewMode, cpuAllocatedGlobalHist, cpuAllocatedProdHist));
    const { icon: Icon, color } = getTrendDisplay(_cpuSort, resultCpuView);
    const displayValue = resultCpuView === "NR" ? "NR" : resultCpuView;
    return (
        <ToolTipLayout
            title={`CPU VM reservé : ${displayOrNR(_cpuSort)} (${displayValue})`}
            content={
                <div>
                    {displayOrNR(_cpuSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}

export function CpuUsedCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _cpuUsedSort, cpuUsedHist, cpuUsedProdHist } = row.original;
    const resultCpuUsedView = cpuToHourKube(getViewMode(viewMode, cpuUsedHist, cpuUsedProdHist));
    const { icon: Icon, color } = getTrendDisplay(_cpuUsedSort, resultCpuUsedView);
    const displayValue = resultCpuUsedView === "NR" ? "NR" : resultCpuUsedView;
    return (
        <ToolTipLayout
            title={`CPU Kube utilisé : ${displayOrNR(_cpuUsedSort)} (${displayValue})`}
            content={
                <div>
                    {displayOrNR(_cpuUsedSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}

export function RamAlloueeCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _ramSort, ramAllocatedGlobalHist, ramAllocatedProdHist } = row.original;
    const resultRamView = getViewMode(viewMode, ramAllocatedGlobalHist, ramAllocatedProdHist);
    const { icon: Icon, color } = getTrendDisplay(_ramSort, resultRamView);
    return (
        <ToolTipLayout
            title={`RAM VM reservé : ${displayOrNR(_ramSort)} (${resultRamView})`}
            content={
                <div>
                    {displayOrNR(_ramSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}

export function RamUsedCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _ramUsedSort, ramUsedHist, ramUsedProdHist } = row.original;
    const resultRamUsedView = getViewMode(
        viewMode,
        toGBString(ramUsedHist),
        toGBString(ramUsedProdHist)
    );
    const { icon: Icon, color } = getTrendDisplay(_ramUsedSort, resultRamUsedView);
    return (
        <ToolTipLayout
            title={`RAM Kube utilisé : ${displayOrNR(_ramUsedSort)} (${resultRamUsedView === "NR" ? "NR" : displayGB(resultRamUsedView)})`}
            content={
                <div>
                    {displayOrNR(_ramUsedSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}

export function ConsoCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _consoSort, consoGlobalHist, consoProdHist } = row.original;
    const resultConsoView = getViewMode(viewMode, consoGlobalHist, consoProdHist);
    const { icon: Icon, color } = getTrendDisplay(_consoSort, resultConsoView);
    return (
        <ToolTipLayout
            title={`Consommation : ${displayOrNR(_consoSort)} (${resultConsoView})`}
            content={
                <div>
                    {displayOrNR(_consoSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}
