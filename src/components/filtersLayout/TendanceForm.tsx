import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { JSX } from "react";
import { format, parse } from "date-fns";
import "styles/tendance-filter.css";

export interface TendancePeriodeFormProps {
    dateFin: string;
    dateDebut: string;
    handleChange: (field: "dateFin" | "dateDebut", value: Date | null) => void;
    validDatesSet?: Set<string>;
}

export function TendancePeriodeForm({
    dateFin,
    dateDebut,
    handleChange,
    validDatesSet
}: Readonly<TendancePeriodeFormProps>): JSX.Element {
    const shouldDisableDate = (date: Date): boolean => {
        if (validDatesSet === undefined || validDatesSet.size === 0) return false;
        return !validDatesSet.has(format(date, "dd/MM/yyyy"));
    };
    return (
        <div className="periode-form">
            <div className="periode-form__pickers">
                <div className="periode-form__picker">
                    <DatePicker
                        label="Date début"
                        value={dateDebut ? parse(dateDebut, "dd/MM/yyyy", new Date()) : null}
                        onChange={newValue => handleChange("dateDebut", newValue)}
                        shouldDisableDate={shouldDisableDate}
                        slotProps={{
                            textField: {
                                size: "small",
                                fullWidth: true,
                                placeholder: "jj/mm/aaaa"
                            }
                        }}
                    />
                </div>
                <div className="periode-form__picker">
                    <DatePicker
                        label="Date fin"
                        value={dateFin ? parse(dateFin, "dd/MM/yyyy", new Date()) : null}
                        onChange={newValue => handleChange("dateFin", newValue)}
                        shouldDisableDate={shouldDisableDate}
                        slotProps={{
                            textField: {
                                size: "small",
                                fullWidth: true,
                                placeholder: "jj/mm/aaaa"
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
