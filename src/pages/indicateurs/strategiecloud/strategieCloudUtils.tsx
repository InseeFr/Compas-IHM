import type { DerniereStrategieCloudDto } from "todos-api/client.gen";

export function getStrategieCommune(
    strategies: DerniereStrategieCloudDto[]
): DerniereStrategieCloudDto | null {

    if (strategies.length === 0) {
        return null;
    }

    const premiereStrategie = strategies[0];

    const toutesIdentiques = strategies.every(
        strategie =>
            strategie.strategieCloud === premiereStrategie.strategieCloud &&
            strategie.envCibleProd === premiereStrategie.envCibleProd &&
            strategie.commentaire === premiereStrategie.commentaire
    );

    return toutesIdentiques ? premiereStrategie : null;
}