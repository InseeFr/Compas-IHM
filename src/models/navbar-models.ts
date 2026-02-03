export interface NavBarModel {
    items: NavItem[];
}

interface SubItem {
    label: string;
    to: string;
}

interface NavItem {
    title: string;
    to?: string;
    subItem?: SubItem[];
}

export interface IArianeNav {
    nav: string;
    link: string;
}
