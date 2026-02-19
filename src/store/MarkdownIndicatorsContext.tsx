import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getIndicatorsMarkdowns, type GetIndicatorsMarkdowns200 } from "todos-api/client.gen";

interface MarkdownContextType {
    markdowns: GetIndicatorsMarkdowns200;
}

const MarkdownContext = createContext<MarkdownContextType | undefined>(undefined);

export const MarkdownProvider = ({ children }: { children: ReactNode }) => {
    const [markdowns, setMarkdowns] = useState<GetIndicatorsMarkdowns200>({});

    useEffect(() => {
        getIndicatorsMarkdowns()
            .then(setMarkdowns)
            .catch(err => console.error("Erreur lors de la récupération des markdowns", err));
    }, []);
    const values = useMemo(() => {
        return { markdowns };
    }, [markdowns]);
    return <MarkdownContext.Provider value={values}>{children}</MarkdownContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMarkdown = (): MarkdownContextType => {
    const context = useContext(MarkdownContext);

    if (!context) {
        throw new Error("useMarkdown doit être utilisé dans MarkdownProvider");
    }

    return context;
};
