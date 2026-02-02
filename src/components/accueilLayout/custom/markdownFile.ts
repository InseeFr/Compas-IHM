export const markdownFiles: Record<string, string> = import.meta.glob(
    "../../../assets/content/**/*.md",
    {
        query: "?raw",
        import: "default",
        eager: true
    }
);
