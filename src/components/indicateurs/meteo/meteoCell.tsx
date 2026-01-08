import { Box } from "@mui/material";
import type { MeteoIndicateur } from "models/indicateurs";
import { ToolTipLayout } from "pages/ToolTipLayout";
import React, { type JSX } from "react";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WaterDropTwoToneIcon from "@mui/icons-material/WaterDropTwoTone";
import WbCloudyIcon from "@mui/icons-material/WbCloudy";
import WbSunnyIcon from "@mui/icons-material/WbSunny";

const getMeteoIcon = (val: string) => {
    switch (val) {
        case "1":
            return <ThunderstormIcon sx={{ color: "#1976d2", fontSize: 20 }} />;
        case "2":
            return <WaterDropTwoToneIcon sx={{ color: "#0288d1", fontSize: 20 }} />;
        case "3":
            return <WbCloudyIcon sx={{ color: "#757575", fontSize: 20 }} />;
        case "4":
            return <WbSunnyIcon sx={{ color: "#fbc02d", fontSize: 20 }} />;
        default:
            return <span style={{ fontSize: 12, opacity: 0.75 }}>{val}</span>;
    }
};

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
