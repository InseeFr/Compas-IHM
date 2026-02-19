import {
    Autocomplete,
    Box,
    Divider,
    LinearProgress,
    Paper,
    Stack,
    type AutocompleteRenderInputParams
} from "@mui/material";
import type { AllIndicators } from "models/indicateurs";
import AnimatedTitle from "components/AnimatedTitleLayout";
import type { Dispatch, JSX, ReactNode, SetStateAction } from "react";
import DataPreview from "./DataPreview";
import "styles/dashboard.css";
import Ariane from "components/Ariane";

interface DashboardPageLayoutProps<T extends AllIndicators> {
    title: string;
    filters: ReactNode;
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
        <div className="dashboard-layout">
            <Ariane items={[{ nav: props.title, link: "" }]} />
            <div className="dashboard-title-section">
                <AnimatedTitle text={props.title} />
            </div>
            <Stack className="dashboard-filters">{props.filters}</Stack>
            <Divider className="dashboard-divider" />
            <Paper className="dashboard-paper">
                <Box className="autocomplete-container">
                    <Autocomplete<T>
                        options={props.dashboardData}
                        loading={props.loading}
                        getOptionLabel={props.label}
                        onChange={(_, value) => props.setter(value)}
                        renderInput={props.renderInputAutoComplete}
                        slotProps={{
                            popupIndicator: {
                                "aria-label": "Ouvrir",
                                title: "Ouvrir",
                                tabIndex: 0
                            }
                        }}
                    />
                </Box>

                {props.loading && (
                    <Box className="loading-container">
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
        </div>
    );
}
