import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WaterDropTwoToneIcon from "@mui/icons-material/WaterDropTwoTone";
import WbCloudyIcon from "@mui/icons-material/WbCloudy";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import type { JSX } from "react";

export const getMeteoIcon = (val?: number): JSX.Element => {
    if (val === undefined)
        return (
            <QuestionMarkIcon sx={{ color: "#d46407ff", fontSize: 20 }} titleAccess="Météo inconnue" />
        );

    switch (val) {
        case 1:
            return <ThunderstormIcon sx={{ color: "#1976d2", fontSize: 20 }} titleAccess="Orage" />;
        case 2:
            return <WaterDropTwoToneIcon sx={{ color: "#0288d1", fontSize: 20 }} titleAccess="Pluie" />;
        case 3:
            return <WbCloudyIcon sx={{ color: "#757575", fontSize: 20 }} titleAccess="Nuageux" />;
        case 4:
            return <WbSunnyIcon sx={{ color: "#fbc02d", fontSize: 20 }} titleAccess="Ensoleillé" />;
        default:
            return (
                <QuestionMarkIcon
                    sx={{ color: "#d46407ff", fontSize: 20 }}
                    titleAccess="Météo inconnue"
                />
            );
    }
};
