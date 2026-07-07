import { Typography, Skeleton } from "@mui/material";

interface DataUpdateDateProps {
    label?: string;
    lastDate: string;
    penultimateDate: string;
}

export const GreenItDate = ({
    label = "Données du",
    lastDate,
    penultimateDate
}: DataUpdateDateProps) => {
    if (!lastDate || !penultimateDate) {
        return <Skeleton width={150} height={24} />;
    }
    const formatDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split("/").map(Number);

        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "nowrap" }}>
            {label} {`${formatDate(lastDate)} (du ${formatDate(penultimateDate)})`}
        </Typography>
    );
};
