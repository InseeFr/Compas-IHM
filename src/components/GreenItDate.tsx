import { Typography, Skeleton } from "@mui/material";
import { useCompasDataDate } from "hooks/useCompasDataDate";

interface DataUpdateDateProps {
    label?: string;
}

export const GreenItDate = ({ label = "Données du" }: DataUpdateDateProps) => {
    const { data: dateMaj, isLoading, isError } = useCompasDataDate();

    if (isLoading) {
        return <Skeleton width={150} height={24} />;
    }

    if (isError || !dateMaj) {
        return null;
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "nowrap" }}>
            {label} {formatDate(dateMaj)}
        </Typography>
    );
};
