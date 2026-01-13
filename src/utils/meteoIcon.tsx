import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WaterDropTwoToneIcon from "@mui/icons-material/WaterDropTwoTone";
import WbCloudyIcon from "@mui/icons-material/WbCloudy";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import ErrorIcon from "@mui/icons-material/Error";

export const getMeteoIcon = (val: string) => {
    switch (val) {
        case "1":
            return <ThunderstormIcon sx={{ color: "#1976d2", fontSize: 20 }} />;
        case "2":
            return <WaterDropTwoToneIcon sx={{ color: "#0288d1", fontSize: 20 }} />;
        case "3":
            return <WbCloudyIcon sx={{ color: "#757575", fontSize: 20 }} />;
        case "4":
            return <WbSunnyIcon sx={{ color: "#fbc02d", fontSize: 20 }} />;
        default:
            return <ErrorIcon sx={{ color: "#b90404ff", fontSize: 20 }} />;
    }
};
