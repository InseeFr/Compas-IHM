import { Box } from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef, type MRT_Row, type MRT_RowData, type MRT_TableInstance} from "material-react-table";
import type { JSX } from "react";
import type { Pagination } from "../models/table-model";

interface TablePageLayoutProps<T extends MRT_RowData> {
  titleTable:string;
  columns: MRT_ColumnDef<T>[];
  data: T[];
  paginationConfig: Pagination;
  rowId?: (originalRow: T, index?: number, parentRow?: MRT_Row<T>) => string;
  renderTopCustom?: (props: {table: MRT_TableInstance<T>}) => React.ReactNode;
}

export default function TablePageLayout<T extends MRT_RowData>(
  props: Readonly<TablePageLayoutProps<T>>
): JSX.Element {
  return (
    <Box
            sx={{
                width: "100%",
                minHeight: "100vh",
                padding: 0,
                margin: 0
            }}
        >
      {<h1 style={{ textAlign: "center" }}>{props.titleTable}</h1>}

      <MaterialReactTable
        data={props.data}
        columns={props.columns}
        enableExpanding={true}
        enableColumnFilters={false}
        enableColumnActions={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableHiding={false}
        initialState={{
          pagination: props.paginationConfig.pagination,
          showColumnFilters: false,
        }}
        getRowId={props.rowId}
        renderTopToolbarCustomActions={props.renderTopCustom}
      />
    </Box>
  );
}

