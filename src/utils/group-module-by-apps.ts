type ModuleLike = {
    isModule?: boolean;
    parentApplication?: string;
};

export const groupModulesByApp = <T extends ModuleLike>(data: T[]): Record<string, T[]> => {
    return data.reduce(
        (acc, item) => {
            if (item.isModule && item.parentApplication) {
                acc[item.parentApplication] ||= [];
                acc[item.parentApplication].push(item);
            }
            return acc;
        },
        {} as Record<string, T[]>
    );
};
