import ExternalLink from "./external-link";
import { generateLinkId } from "./helpers";

interface MarkdownLinkProps {
    href?: string;
    children?: React.ReactNode;
}

export default function MarkdownLink({ href, children, ...rest }: Readonly<MarkdownLinkProps>) {
    const linkId = generateLinkId();
    if (!href) {
        return <span id={linkId}>{children}</span>;
    }
    const isHttpLink: boolean = href.startsWith("http://") || href.startsWith("https://");

    if (isHttpLink) {
        return <ExternalLink href={href}>{children}</ExternalLink>;
    }

    return (
        <a href={href} {...rest}>
            {children}
        </a>
    );
}
