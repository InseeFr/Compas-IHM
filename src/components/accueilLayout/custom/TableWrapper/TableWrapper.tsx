import "styles/TableWrapper.css";

interface ITableWrapper {
    children?: React.ReactNode;
    noScroll?: boolean;
    noCaption?: boolean;
}

const TableWrapper = ({ children, noScroll = false, noCaption = false }: ITableWrapper) => {
    return (
        <div
            className={`fr-table ${noScroll ? "fr-table--no-scroll" : ""} ${noCaption ? "fr-table--no-caption" : ""}`}
        >
            <div className="fr-table__wrapper">
                <div className="fr-table__container">
                    <div className="fr-table__content">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default TableWrapper;
