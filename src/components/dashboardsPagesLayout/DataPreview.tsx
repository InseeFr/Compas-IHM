import { Card, CardContent, CardHeader } from "@mui/material";
import type { JSX, ReactNode } from "react";
import "styles/datapreview.css";

interface DataPreviewProps {
    title?: string;
    subHeader: ReactNode;
    content: ReactNode;
}

export default function DataPreview(props: Readonly<DataPreviewProps>): JSX.Element {
    return (
        <Card elevation={4} className="data-preview-card">
            <CardHeader
                className="data-preview-header"
                title={props.title}
                subheader={props.subHeader}
                tabIndex={0}
                aria-label={props.title}
            />
            <CardContent className="data-preview-content">{props.content}</CardContent>
        </Card>
    );
}
