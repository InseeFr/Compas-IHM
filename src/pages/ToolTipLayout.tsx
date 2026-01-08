import { Tooltip } from "@mui/material";
import type { JSX, ReactNode } from "react";

interface ToolTipLayoutProps<T> {
    title: ReactNode;
    content: T;
    key?: string;
}

export function ToolTipLayout<T extends ReactNode>(props: Readonly<ToolTipLayoutProps<T>>): JSX.Element {
    return (
        <Tooltip title={props.title} key={props.key}>
            <span>{props.content}</span>
        </Tooltip>
    );
}
