import { Tooltip } from "@mui/material";
import type { JSX, ReactNode } from "react";

interface ToolTipLayoutProps {
    title: ReactNode;
    content: ReactNode;
    key?: string;
}

export function ToolTipLayout(props: Readonly<ToolTipLayoutProps>): JSX.Element {
    return (
        <Tooltip title={props.title} key={props.key}>
            <div>{props.content}</div>
        </Tooltip>
    );
}
