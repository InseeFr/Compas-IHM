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

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick(event as unknown as React.MouseEvent<HTMLButtonElement>, index);
        }
    };

    return (
        <Box component="ul" sx={{ listStyle: "none", padding: 0, margin: 0, display: "flex" }}>
            {props.items.map((item, index) => {
                const isExpanded = open && activeIndex === index;
                const subMenuId = `submenu-${index}`;
                const buttonId = `navbar-button-${index}-${item.title.replace(/\s+/g, "-")}`;

                return (
                    <Box
                        component="li"
                        key={item.title}
                        className={`${darkMode ? "dark-mode" : "light-mode"}`}
                    >
                        {item.subItem ? (
                            <>
                                <Button
                                    id={buttonId}
                                    className="navbar-button"
                                    data-role="button"
                                    data-testid={buttonId}
                                    aria-controls={subMenuId}
                                    aria-expanded={isExpanded ? "true" : "false"}
                                    aria-label={item.title}
                                    onClick={e => handleClick(e, index)}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                >
                                    <Typography noWrap className="navbar-title">
                                        {item.title}
                                    </Typography>
                                </Button>
                                <Menu
                                    id={subMenuId}
                                    anchorEl={anchorEl}
                                    open={isExpanded}
                                    onClose={handleClose}
                                    MenuListProps={{
                                        "aria-labelledby": buttonId,
                                        component: "ul"
                                    }}
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
                            </>
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
                    </Box>
                );
            })}
        </Box>
    );
}
