import { Tooltip } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";

export function createAppNameColumn<T extends { appNameLong?: string }>(
    accessorKey: string,
    header: string
): MRT_ColumnDef<T> {
    return {
        accessorKey,
        header,
        size: 140,
        enableColumnFilterModes: false,
        // eslint-disable-next-line react/prop-types
        Cell: ({ cell, row }) => {
            // eslint-disable-next-line react/prop-types
            const value = cell.getValue<string>();
            // eslint-disable-next-line react/prop-types
            const appNameLong = row.original?.appNameLong;
            if (appNameLong) {
                return (
                    <Tooltip 
                        title={appNameLong} 
                        placement="top"
                        arrow
                        slotProps={{
                            popper: {
                                sx: {
                                    marginTop: "-10px !important"
                                }
                            }
                        }}
                    >
                        <span
                            style={{
                                cursor: "default",
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "inline-block",
                            }}
                        >
                            {value}
                        </span>
                    </Tooltip>
                );
            }

            return <span>{value}</span>;
        },
    };
}