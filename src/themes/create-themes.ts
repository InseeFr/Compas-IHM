import { createTheme, type Components, type Theme } from "@mui/material/styles";

const LIGHT = {
    DEFAULT: "#757575",
    HOVER: "#AF49B7",
    FOCUS: "#9F4E9B"
};

const DARK = {
    DEFAULT: "#9E9E9E",
    HOVER: "#CE8FD4",
    FOCUS: "#D4A0D3"
};

// saisie cloud
function buildComponents(c: typeof LIGHT): Components<Theme> {
    return {
        MuiFormLabel: {
            styleOverrides: {
                root: { "&.Mui-focused": { color: c.FOCUS } }
            }
        },
        MuiInputLabel: {
            styleOverrides: {
                root: { "&.Mui-focused": { color: c.FOCUS } }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: c.DEFAULT },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: c.HOVER },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: c.FOCUS },
                    "&.Mui-focused": {
                        boxShadow: `0 0 0 3px ${c.FOCUS}26`
                    }
                }
            }
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: c.FOCUS }
                }
            }
        },
        MuiRadio: {
            styleOverrides: {
                root: { "&.Mui-checked": { color: c.FOCUS } }
            }
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: `${c.FOCUS}1A`
                },
                bar: { borderRadius: 3, backgroundColor: c.FOCUS }
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                option: {
                    "&:hover": { background: `${c.FOCUS}14 !important` },
                    "&.Mui-focused": { background: `${c.FOCUS}1F !important` }
                }
            }
        }
    };
}

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#1976d2" },
        background: { default: "#F8FAFC", paper: "#F8FAFC" }
    },
    components: buildComponents(LIGHT)
});
export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#90caf9" },
        background: { default: "#0f0f23", paper: "#181833" }
    },
    components: buildComponents(DARK)
});
