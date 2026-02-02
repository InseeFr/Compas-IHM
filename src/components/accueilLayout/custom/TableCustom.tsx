import type { Components } from "react-markdown";
import TableWrapper from "./TableWrapper/TableWrapper";

export const CustomTable: Components = {
    table: ({ ...props }) => (
        <TableWrapper noScroll>
            <table {...props}>
                <caption className="fr-sr-only">Tableau</caption>
                {props.children}
            </table>
        </TableWrapper>
    ),
    th: ({ ...props }) => <th scope="col" {...props} />
};
