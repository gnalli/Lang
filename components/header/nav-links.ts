export type CommandPaletteLink = {
    name: string
    href: string
    shortcut: string
}

export const COMMAND_PALETTE_LINKS: CommandPaletteLink[] = [
    { name: "云原生", href: "/categories/cloud-native", shortcut: "" },
    { name: "数据库", href: "/categories/database", shortcut: "" },
    { name: "网络", href: "/categories/network", shortcut: "" },
    { name: "后端", href: "/categories/backend", shortcut: "" },
    { name: "关于我", href: "/about", shortcut: "" },
]
