import * as React from "react";
import { Button, Menu, MenuItem, Typography, useTheme } from "@mui/material";
import { Link } from "@tanstack/react-router";
import type { NavBarModel } from "../models/navbar-models";

interface IMenuLayoutProps {
    props: NavBarModel;
}

export default function MenuNavBarLayout({ props }: Readonly<IMenuLayoutProps>) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        setAnchorEl(event.currentTarget);
        setActiveIndex(index);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setActiveIndex(null);
    };

    return (
        <>
            {props.items.map((item, index) => (
                <React.Fragment key={item.title}>
                    {item.subItem ? (
                        <>
                            <Button
                                role="button"
                                data-testid={`navbar-button-${index}-${item.title}`}
                                aria-controls={open && activeIndex === index ? "basic-menu" : undefined}
                                aria-expanded={open && activeIndex === index ? "true" : undefined}
                                onClick={e => handleClick(e, index)}
                            >
                                <Typography
                                    noWrap
                                    sx={{
                                        fontFamily: "monospace",
                                        letterSpacing: ".1rem",
                                        color: theme.palette.text.primary
                                    }}
                                >
                                    {item.title}
                                </Typography>
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={open && activeIndex === index}
                                onClose={handleClose}
                                slotProps={{
                                    paper: {
                                        sx: { backgroundColor: theme.palette.background.paper }
                                    }
                                }}
                            >
                                {item.subItem.map((sub, subIndex) => (
                                    <MenuItem
                                        role="menuitem"
                                        data-testid={`navbar-menu-${index}-${subIndex}-${sub.label}`}
                                        key={sub.label}
                                        onClick={handleClose}
                                        component={Link}
                                        to={sub.to}
                                        sx={{ color: theme.palette.text.primary }}
                                    >
                                        {sub.label}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </>
                    ) : (
                        <Button
                            component={Link}
                            to={item.to}
                            role="button"
                            sx={{ textTransform: "none" }}
                        >
                            <Typography
                                noWrap
                                sx={{
                                    fontFamily: "monospace",
                                    letterSpacing: ".1rem",
                                    color: theme.palette.text.primary
                                }}
                            >
                                {item.title}
                            </Typography>
                        </Button>
                    )}
                </React.Fragment>
            ))}
        </>
    );
}
