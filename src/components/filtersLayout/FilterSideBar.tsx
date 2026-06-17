import { useEffect, useRef, type ReactNode } from "react";
import { Drawer, IconButton, Button, Typography } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import type { AllIndicators } from "models/indicateurs";
import { SelectedFiltersLayout } from "components/filtersLayout/SelectedFiltersLayout";
import type { Action, FilterState } from "store/filterContext";
import { useFilters } from "hooks/useFilters";
import "styles/filter-sidebar.css";
import { TendancePeriodeForm } from "./TendanceForm";
import type { ActionTendance, TendanceState } from "store/tendance-context";
import { format } from "date-fns";

interface FilterSidebarProps {
    customFilters?: ReactNode;
    state: FilterState;
    dispatch: React.Dispatch<Action>;
    stateTendance?: TendanceState;
    dispatchTendance?: React.Dispatch<ActionTendance>;
    data: AllIndicators[];
}

export const FilterSidebar = ({
    state,
    dispatch,
    stateTendance,
    dispatchTendance,
    data,
    customFilters
}: Readonly<FilterSidebarProps>) => {
    const {
        open,
        setOpen,
        setTempFilters,
        handleReset,
        openSidebar,
        tempFilters,
        totalActive,
        filteredForService,
        filteredForDomaine,
        filteredForDomaineFonc
    } = useFilters({ state, stateTendance, data });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const headingId: string = "filter-sidebar-heading";

    const handleClose = (): void => {
        setOpen(false);
        triggerRef.current?.focus();
    };

    const handleApply = (): void => {
        dispatch({ type: "SET_SERVICE_DEV", payload: tempFilters.serviceDev });
        dispatch({ type: "SET_DOMAINE_DEV", payload: tempFilters.domaineDev });
        dispatch({ type: "SET_DOMAINE_FONC", payload: tempFilters.domaineFonc });
        if (dispatchTendance) {
            dispatchTendance({ type: "SET_DATE_DEBUT", payload: tempFilters.dateDebut ?? "" });
            dispatchTendance({ type: "SET_DATE_FIN", payload: tempFilters.dateFin ?? "" });
        }
        handleClose();
    };

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleClose, open]);

    const badge = totalActive > 0 && <span className="filter-drawer__title-badge">{totalActive}</span>;

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className={`filter-trigger${open || totalActive > 0 ? " active" : ""}`}
                aria-controls="filter-sidebar"
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={openSidebar}
            >
                <TuneIcon sx={{ fontSize: 16 }} aria-hidden="true" />
                {/* Demander si je laisse  */}
                Filtres des colonnes du tableau
                {totalActive > 0 && (
                    <span
                        className="filter-trigger__badge"
                        aria-label={`${totalActive} filtre${totalActive > 1 ? "s" : ""} actif${totalActive > 1 ? "s" : ""}`}
                    >
                        {totalActive}
                    </span>
                )}
            </button>

            <Drawer
                id="filter-sidebar"
                anchor="left"
                open={open}
                onClose={handleClose}
                className="filter-drawer"
                aria-labelledby={headingId}
                ModalProps={{ keepMounted: true }}
                slotProps={{ backdrop: { className: "filter-overlay" } }}
            >
                <div className="filter-drawer__header">
                    <Typography component="h1" id={headingId} className="filter-drawer__title">
                        Filtres {badge}
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        aria-label="Fermer le panneau de filtres"
                        className="filter-drawer__close"
                        size="small"
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>

                <div className="filter-drawer__body">
                    <Typography component="h2" className="filter-drawer__title">
                        Critères
                    </Typography>
                    <SelectedFiltersLayout
                        filters={[
                            {
                                title: "Service dev.",
                                selectedOne: tempFilters.serviceDev,
                                onChange: e =>
                                    setTempFilters(prev => ({ ...prev, serviceDev: e.target.value })),
                                dataFilter: filteredForService,
                                getValue: item => item.sndi
                            },
                            {
                                title: "Domaine dev.",
                                selectedOne: tempFilters.domaineDev,
                                onChange: e =>
                                    setTempFilters(prev => ({ ...prev, domaineDev: e.target.value })),
                                dataFilter: filteredForDomaine,
                                getValue: item => item.domaine
                            },
                            {
                                title: "Domaine Fonct.",
                                selectedOne: tempFilters.domaineFonc,
                                onChange: e =>
                                    setTempFilters(prev => ({ ...prev, domaineFonc: e.target.value })),
                                dataFilter: filteredForDomaineFonc,
                                getValue: item => item.domaineFonc
                            }
                        ]}
                    />
                    {stateTendance && dispatchTendance && (
                        <>
                            <Typography component="h2" className="filter-drawer__title">
                                Période
                            </Typography>
                            <TendancePeriodeForm
                                dateFin={tempFilters?.dateFin ?? ""}
                                dateDebut={tempFilters?.dateDebut ?? ""}
                                handleChange={(field, value) => {
                                    const formatted = value ? format(value, "dd/MM/yyyy") : "";
                                    if (field === "dateFin") {
                                        setTempFilters(prev => ({ ...prev, dateFin: formatted }));
                                    } else {
                                        setTempFilters(prev => ({ ...prev, dateDebut: formatted }));
                                    }
                                }}
                            />
                        </>
                    )}
                    {customFilters}
                </div>

                <div className="filter-drawer__footer">
                    <Button
                        variant="outlined"
                        onClick={handleReset}
                        className="filter-drawer__btn-reset"
                        disableElevation
                    >
                        Réinitialiser
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApply}
                        className="filter-drawer__btn-apply"
                        disableElevation
                    >
                        Appliquer
                    </Button>
                </div>
            </Drawer>
        </>
    );
};
