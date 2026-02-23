import { useQuery } from "@tanstack/react-query";
import { getNombreVirtualMachine } from "todos-api/client.gen";

const COMPAS_APPLICATION_ID = 201;

export const useCompasDataDate = () => {
    return useQuery({
        queryKey: ["compasDataDate", COMPAS_APPLICATION_ID],
        queryFn: async () => {
            const data = await getNombreVirtualMachine(COMPAS_APPLICATION_ID);
            return data.dateMaj;
        },
        staleTime: 1000 * 60 * 5,
        retry: false
    });
};
