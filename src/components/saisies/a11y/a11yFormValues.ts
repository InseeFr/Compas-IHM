import type { InfosSaisiesA11yToSaveDTO } from "todos-api/client.gen";

export type A11yFormValues = Omit<InfosSaisiesA11yToSaveDTO, "idModule"> & {
    idsModule: number[];
};

export const TYPES_AUDIT: number[] = [511, 512, 513];

export const DEFAULT_TYPE_AUDIT: number = 510;
