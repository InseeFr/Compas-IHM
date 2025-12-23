export interface NavBarModel {
    items: NavItem[];
}

interface NavItem {
    title: string;
    subItem?: string[];
}
