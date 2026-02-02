import "../styles/acces-rapide.css";

interface AccesRapideProps {
    darkMode: boolean;
}

export default function AccesRapide({ darkMode }: Readonly<AccesRapideProps>) {
    return (
        <nav
            role="navigation"
            aria-label="Accès rapide"
            className={`skip-links ${darkMode ? "dark-mode" : ""}`}
        >
            <ul>
                <li>
                    <a href="#contenu">Contenu</a>
                </li>
                <li>
                    <a href="#navigation">Menu</a>
                </li>
                <li>
                    <a href="#pied-de-page">Pied de page</a>
                </li>
            </ul>
        </nav>
    );
}