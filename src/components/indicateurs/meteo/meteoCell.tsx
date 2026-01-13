import { Box } from "@mui/material";
import type { MeteoIndicateur } from "models/indicateurs";
import { ToolTipLayout } from "pages/ToolTipLayout";
import React, { type JSX } from "react";
import { getMeteoIcon } from "utils/meteoIcon";

export function MeteoCell({
    row,
    column
}: Readonly<{ row: { original: MeteoIndicateur }; column: { id?: string } }>): JSX.Element | null {
    const mk = column.id?.replace("m-", "") ?? "";
    const points = row.original.byMonth?.[mk] ?? [];

    if (!points.length) return null;

    return (
        <React.Fragment>
            {points.map((p, i) => (
                <ToolTipLayout
                    key={`${p.date}-${i}`}
                    title={
                        <div style={{ whiteSpace: "pre-line" }}>
                            <strong>Date :</strong> {p.date}
                            {p.commentaire ? `\n${p.commentaire}` : ""}
                        </div>
                    }
                    content={
                        <Box
                            component="span"
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 24,
                                height: 24
                            }}
                        >
                            {getMeteoIcon(p.valeur)}
                        </Box>
                    }
                />
            ))}
        </React.Fragment>
    );
}
