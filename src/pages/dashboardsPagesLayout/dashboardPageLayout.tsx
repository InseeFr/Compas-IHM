import {
    Autocomplete,
    Box,
    LinearProgress,
    Paper,
    type AutocompleteRenderInputParams
} from "@mui/material";
import type { AllIndicators } from "models/indicateurs";
import AnimatedTitle from "pages/AnimatedTitleLayout";
import type { Dispatch, JSX, ReactNode, SetStateAction } from "react";
import DataPreview from "./DataPreview";

interface DashboardPageLayoutProps<T extends AllIndicators> {
    title: string;
    dashboardData: T[];
    loading: boolean;
    setter: Dispatch<SetStateAction<T | null>>;
    getter: T | null;
    renderInputAutoComplete: (params: AutocompleteRenderInputParams) => ReactNode;
    subHeader: ReactNode;
    renderContent: ReactNode;
    titleCard?: string;
    label: (option: T) => string;
}

export default function DashboardPageLayout<T extends AllIndicators>(
    props: Readonly<DashboardPageLayoutProps<T>>
): JSX.Element {
    return (
        <Paper
            sx={theme => ({
                p: { xs: 2, sm: 3, md: 4 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: theme.spacing(3),
                color: "text.primary",
                width: "100%",
                maxWidth: 900,
                mx: "auto"
            })}
        >
            <AnimatedTitle text={props.title} />
            <Box width="100%" maxWidth={560}>
                <Autocomplete<T>
                    options={props.dashboardData}
                    loading={props.loading}
                    getOptionLabel={props.label}
                    onChange={(_, value) => props.setter(value)}
                    renderInput={props.renderInputAutoComplete}
                />
            </Box>

            {props.loading && (
                <Box width="100%" maxWidth={600}>
                    <LinearProgress />
                </Box>
            )}

            {props.getter && (
                <DataPreview
                    title={props.titleCard}
                    subHeader={props.subHeader}
                    content={props.renderContent}
                />
            )}
        </Paper>
    );
}
