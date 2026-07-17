import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ToolTipLayout } from "components/ToolTipLayout";
import type { ViewMode } from "constantes/constantes";
import { TREND_CONFIG } from "constantes/trend.constants";
import type { Trend } from "constantes/trend.utils";
import type { GreenITIndicateur } from "models/indicateurs";
import type { JSX } from "react";
import { formatNumberWithSpaces, formatOrNRWithUnit } from "./greenItConfig";

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

const getViewMode = (view: ViewMode, global: string, prod: string, hp: string) => {
    const prodValOrHp = view === "prod" ? prod : hp;
    const raw = view === "global" ? global : prodValOrHp;
    const val = Math.round(Number(raw));
    return Number.isNaN(val) ? "NR" : val;
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

const displayOrNR = (sortValue: number | string | null | undefined) => {
    if (sortValue === null || sortValue === undefined || sortValue === "") return "NR";
    if (typeof sortValue === "number") return formatNumberWithSpaces(sortValue);
    return sortValue;
};

export function NbVMCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _nbVmSort, nbVMGlobalHist, nbVMProdHist, nbVMHpHist } = row.original;
    const resultNbVmView = getViewMode(viewMode, nbVMGlobalHist, nbVMProdHist, nbVMHpHist);
    const { icon: Icon, color } = getTrendDisplay(_nbVmSort, resultNbVmView);
    return (
        <ToolTipLayout
            title={`Nombre de VM : ${displayOrNR(_nbVmSort)} (${resultNbVmView === "NR" ? "NR" : formatOrNRWithUnit(resultNbVmView)})`}
            content={
                <div>
                    {displayOrNR(_nbVmSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}

export function NbPodCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _nbPodMaxiSort, nbPodMaxiHist, nbPodMaxiProdHist, nbPodMaxiHpHist } = row.original;
    const resultNbPodView = getViewMode(viewMode, nbPodMaxiHist, nbPodMaxiProdHist, nbPodMaxiHpHist);
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
    const { _diskSort, diskAllocatedGlobalHist, diskAllocatedProdHist, diskAllocatedHpHist } =
        row.original;
    const resultDiskUsedView = getViewMode(
        viewMode,
        diskAllocatedGlobalHist,
        diskAllocatedProdHist,
        diskAllocatedHpHist
    );
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
    const { _diskUsedSort, diskUsedHist, diskUsedProdHist, diskUsedHpHist } = row.original;
    const resultDiskUsedView = getViewMode(viewMode, diskUsedHist, diskUsedProdHist, diskUsedHpHist);
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
    const { _pvcUsedSort, pvcUsedHist, pvcUsedProdHist, pvcUsedHpHist } = row.original;
    const resultPvcUsedView = getViewMode(viewMode, pvcUsedHist, pvcUsedProdHist, pvcUsedHpHist);
    const { icon: Icon, color } = getTrendDisplay(_pvcUsedSort, resultPvcUsedView);
    return (
        <ToolTipLayout
            title={`Kube Stockage utilisé : ${displayOrNR(_pvcUsedSort)} (${resultPvcUsedView})`}
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
    const { _s3UsedSort, s3UsedHist, s3UsedProdHist, s3UsedHpHist } = row.original;
    const resultS3UsedView = getViewMode(viewMode, s3UsedHist, s3UsedProdHist, s3UsedHpHist);
    const { icon: Icon, color } = getTrendDisplay(_s3UsedSort, resultS3UsedView);
    return (
        <ToolTipLayout
            title={`S3 utilisé : ${displayOrNR(_s3UsedSort)} (${resultS3UsedView})`}
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
    const { _cpuSort, cpuAllocatedGlobalHist, cpuAllocatedProdHist, cpuAllocatedHpHist } = row.original;
    const resultCpuView = getViewMode(
        viewMode,
        cpuAllocatedGlobalHist,
        cpuAllocatedProdHist,
        cpuAllocatedHpHist
    );
    const { icon: Icon, color } = getTrendDisplay(_cpuSort, resultCpuView);
    return (
        <ToolTipLayout
            title={`CPU VM reservé : ${displayOrNR(_cpuSort)} (${resultCpuView})`}
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
    const { _cpuUsedSort, cpuUsedHist, cpuUsedProdHist, cpuUsedHpHist } = row.original;
    const resultCpuUsedView = getViewMode(viewMode, cpuUsedHist, cpuUsedProdHist, cpuUsedHpHist);
    const { icon: Icon, color } = getTrendDisplay(_cpuUsedSort, resultCpuUsedView);
    return (
        <ToolTipLayout
            title={`CPU Kube utilisé : ${displayOrNR(_cpuUsedSort)} (${resultCpuUsedView})`}
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
    const { _ramSort, ramAllocatedGlobalHist, ramAllocatedProdHist, ramAllocatedHpHist } = row.original;
    const resultRamView = getViewMode(
        viewMode,
        ramAllocatedGlobalHist,
        ramAllocatedProdHist,
        ramAllocatedHpHist
    );
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
    const { _ramUsedSort, ramUsedHist, ramUsedProdHist, ramUsedHpHist } = row.original;
    const resultRamUsedView = getViewMode(viewMode, ramUsedHist, ramUsedProdHist, ramUsedHpHist);
    const { icon: Icon, color } = getTrendDisplay(_ramUsedSort, resultRamUsedView);
    return (
        <ToolTipLayout
            title={`RAM Kube utilisé : ${displayOrNR(_ramUsedSort)} (${resultRamUsedView})`}
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
    const { _consoSort, consoGlobalHist, consoProdHist, consoHpHist } = row.original;
    const resultConsoView = getViewMode(viewMode, consoGlobalHist, consoProdHist, consoHpHist);
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

export function AsAllocatedCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _asAllocatedSort, asAllocatedHist, asAllocatedProdHist, asAllocatedHpHist } = row.original;
    const resultAsAllocatedView = getViewMode(
        viewMode,
        asAllocatedHist,
        asAllocatedProdHist,
        asAllocatedHpHist
    );
    const { icon: Icon, color } = getTrendDisplay(_asAllocatedSort, resultAsAllocatedView);
    return (
        <ToolTipLayout
            title={`AS alloué : ${displayOrNR(_asAllocatedSort)} (${resultAsAllocatedView})`}
            content={
                <div>
                    {displayOrNR(_asAllocatedSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}

export function AsUsedCell(
    { row }: Readonly<{ row: { original: GreenITIndicateur } }>,
    viewMode: ViewMode
) {
    const { _asUsedSort, asUsedHist, asUsedProdHist, asUsedHpHist } = row.original;
    const resultAsUsedView = getViewMode(viewMode, asUsedHist, asUsedProdHist, asUsedHpHist);
    const { icon: Icon, color } = getTrendDisplay(_asUsedSort, resultAsUsedView);
    return (
        <ToolTipLayout
            title={`AS utilisé : ${displayOrNR(_asUsedSort)} (${resultAsUsedView})`}
            content={
                <div>
                    {displayOrNR(_asUsedSort)} {Icon && <Icon sx={{ color }} />}
                </div>
            }
        />
    );
}
