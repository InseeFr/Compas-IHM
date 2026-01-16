import { alpha, Card, CardContent, CardHeader } from "@mui/material";
import type { JSX, ReactNode } from "react";

interface DataPreviewProps {
    title?: string;
    subHeader: ReactNode;
    content: ReactNode;
}

export default function DataPreview(props: Readonly<DataPreviewProps>): JSX.Element {
    return (
        <Card
            elevation={4}
            sx={{
                width: "100%",
                maxWidth: 760,
                borderRadius: 4,
                overflow: "hidden",
                background: t =>
                    `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.08)} 0%, ${alpha(
                        t.palette.background.paper,
                        0.9
                    )} 40%)`,
                backdropFilter: "blur(4px)"
            }}
        >
            <CardHeader title={props.title} subheader={props.subHeader} />
            <CardContent sx={{ pt: 2 }}>{props.content}</CardContent>
        </Card>
    );
}
