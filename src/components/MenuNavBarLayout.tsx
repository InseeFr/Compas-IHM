import * as React from "react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import type { NavBarModel } from "../models/navbar-models";
import "styles/navbar.css";

interface IMenuLayoutProps {
    props: NavBarModel;
    darkMode: boolean;
}

export default function MenuNavBarLayout({ props, darkMode }: Readonly<IMenuLayoutProps>) {
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
                    {item.subItem ? (
                        <Box className={`${darkMode ? "dark-mode" : "light-mode"}`}>
                            <Button
                                className="navbar-button"
                                data-role="button"
                                data-testid={`navbar-button-${index}-${item.title}`}
                                aria-controls={open && activeIndex === index ? "basic-menu" : undefined}
                                aria-expanded={open && activeIndex === index ? "true" : undefined}
                                aria-label={item.title}
                                onClick={e => handleClick(e, index)}
                            >
                                <Typography noWrap className="navbar-title">
                                    {item.title}
                                </Typography>
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={open && activeIndex === index}
                                onClose={handleClose}
                            >
                                {item.subItem.map((sub, subIndex) => (
                                    <MenuItem
                                        className="navbar-menu-item"
                                        data-testid={`navbar-menu-${index}-${subIndex}-${sub.label}`}
                                        key={sub.label}
                                        onClick={handleClose}
                                        component={Link}
                                        to={sub.to}
                                    >
                                        {sub.label}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    ) : (
                        <Button
                            className="navbar-button"
                            component={Link}
                            to={item.to}
                            data-role="button"
                            aria-label={item.title}
                        >
                            <Typography noWrap className="navbar-title">
                                {item.title}
                            </Typography>
                        </Button>
                    )}
                </React.Fragment>
            ))}
        </>
    );
}
