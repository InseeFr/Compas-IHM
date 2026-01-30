import type { Components } from "react-markdown";

export const LinkCustom: Components = {
    a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    )
};
