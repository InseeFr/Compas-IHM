import { Tooltip } from "@mui/material";
import type { JSX, ReactNode } from "react";

interface ToolTipLayoutProps {
    title: string;
    content: ReactNode;
    key?: string;
}

export function ToolTipLayout(props: Readonly<ToolTipLayoutProps>): JSX.Element {
    return (
        <Tooltip
            title={props.title}
            key={props.key}
            arrow
            tabIndex={0}
            aria-label={props.title}
            data-testid={"tooltip"}
        >
            <span>{props.content}</span>
        </Tooltip>
    );
}
