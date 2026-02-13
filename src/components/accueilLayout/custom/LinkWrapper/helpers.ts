let linkCounter: number = 0;

export function generateLinkId(): string {
    return `link-${++linkCounter}`;
}
