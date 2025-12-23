import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import type { NavBarModel } from "../models/navbar-models";
import { Typography } from "@mui/material";

interface IMenuLayoutProps {
    props: NavBarModel;
}

export default function MenuNavBarLayout({ props }: Readonly<IMenuLayoutProps>) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, index: number): void => {
        setAnchorEl(event.currentTarget);
        setActiveIndex(index);
    };

    const handleClose = (): void => {
        setAnchorEl(null);
        setActiveIndex(null);
    };

    return (
        <>
            {props.items.map((item, index) => (
                <React.Fragment key={item.title}>
                    <Button
                        aria-controls={open && activeIndex === index ? "basic-menu" : undefined}
                        aria-expanded={open && activeIndex === index ? "true" : undefined}
                        onClick={e => handleClick(e, index)}
                    >
                        <Typography
                            noWrap
                            sx={{
                                fontFamily: "monospace",
                                letterSpacing: ".1rem",
                                color: "black"
                            }}
                        >
                            {item.title}
                        </Typography>
                    </Button>
                    {item.subItem && (
                        <Menu
                            anchorEl={anchorEl}
                            open={open && activeIndex === index}
                            onClose={handleClose}
                        >
                            {item.subItem.map(sub => (
                                <MenuItem key={sub} onClick={handleClose}>
                                    {sub}
                                </MenuItem>
                            ))}
                        </Menu>
                    )}
                </React.Fragment>
            ))}
        </>
    );
}
