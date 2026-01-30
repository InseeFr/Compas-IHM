import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#1976d2"
        },
        background: {
            default: "#F8FAFC",
            paper: "#F8FAFC"
        }
    }
});
export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#90caf9"
        },
        background: {
            default: "#0f0f23",
            paper: "#181833"
        }
    }
});
