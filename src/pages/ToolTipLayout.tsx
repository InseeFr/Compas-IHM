import { Tooltip } from "@mui/material";
import type { JSX, ReactNode } from "react";

interface ToolTipLayoutProps<T> {
    title: string;
    content: T;
}

export function ToolTipLayout<T extends ReactNode>(props: Readonly<ToolTipLayoutProps<T>>): JSX.Element {
    return (
        <Tooltip title={props.title}>
            <span>{props.content}</span>
        </Tooltip>
    );
}
