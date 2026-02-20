interface ExternalLinkProps {
    href: string;
    children: React.ReactNode;
}

export default function ExternalLink({ href, children }: Readonly<ExternalLinkProps>) {
    return (
        <a href={href} target="_blank" rel="noreferrer noopener" data-testid={"external-link"}>
            {children}
        </a>
    );
}
