import { Link } from "@tanstack/react-router";
import type { IArianeNav } from "models/navbar-models";
import type { JSX } from "react";
import "styles/ariane.css";

interface ArianeProps {
    items: IArianeNav[];
}

export default function Ariane({ items }: Readonly<ArianeProps>): JSX.Element {
    const isLast = (index: number): boolean => {
        return index === items.length - 1;
    };
    return (
        <nav aria-label="Vous êtes ici" className="ariane">
            <ol>
                <li>
                    <Link to={"/"}>Accueil</Link>
                </li>
                {items.map((item, i) =>
                    isLast(i) ? (
                        <li key={item.nav} aria-current={"page"} tabIndex={-1}>
                            {item.nav}
                        </li>
                    ) : (
                        <li key={item.nav}>
                            <Link to={item.link}>{item.nav}</Link>
                        </li>
                    )
                )}
            </ol>
        </nav>
    );
}
