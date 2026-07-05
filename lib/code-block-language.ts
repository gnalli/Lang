export type CodeBlockLanguageMeta = {
    /** 头部展示名 */
    label: string
    /** 色块内缩写 */
    badge: string
    /** 色块 Tailwind 类 */
    badgeClassName: string
}

const LANGUAGE_MAP: Record<string, CodeBlockLanguageMeta> = {
    typescript: {
        label: "TypeScript",
        badge: "TS",
        badgeClassName: "bg-[#3178C6] text-white",
    },
    ts: {
        label: "TypeScript",
        badge: "TS",
        badgeClassName: "bg-[#3178C6] text-white",
    },
    tsx: {
        label: "TSX",
        badge: "TS",
        badgeClassName: "bg-[#3178C6] text-white",
    },
    javascript: {
        label: "JavaScript",
        badge: "JS",
        badgeClassName: "bg-[#F7DF1E] text-[#323330]",
    },
    js: {
        label: "JavaScript",
        badge: "JS",
        badgeClassName: "bg-[#F7DF1E] text-[#323330]",
    },
    jsx: {
        label: "JSX",
        badge: "JS",
        badgeClassName: "bg-[#F7DF1E] text-[#323330]",
    },
    shell: {
        label: "Shell",
        badge: "SH",
        badgeClassName: "bg-zinc-600 text-white",
    },
    bash: {
        label: "Bash",
        badge: "SH",
        badgeClassName: "bg-zinc-600 text-white",
    },
    sh: {
        label: "Shell",
        badge: "SH",
        badgeClassName: "bg-zinc-600 text-white",
    },
    zsh: {
        label: "Zsh",
        badge: "SH",
        badgeClassName: "bg-zinc-600 text-white",
    },
    python: {
        label: "Python",
        badge: "PY",
        badgeClassName: "bg-[#3776AB] text-white",
    },
    py: {
        label: "Python",
        badge: "PY",
        badgeClassName: "bg-[#3776AB] text-white",
    },
    go: {
        label: "Go",
        badge: "GO",
        badgeClassName: "bg-[#00ADD8] text-white",
    },
    golang: {
        label: "Go",
        badge: "GO",
        badgeClassName: "bg-[#00ADD8] text-white",
    },
    json: {
        label: "JSON",
        badge: "JSON",
        badgeClassName: "bg-amber-600 text-white",
    },
    yaml: {
        label: "YAML",
        badge: "YAML",
        badgeClassName: "bg-[#CB171E] text-white",
    },
    yml: {
        label: "YAML",
        badge: "YAML",
        badgeClassName: "bg-[#CB171E] text-white",
    },
    sql: {
        label: "SQL",
        badge: "SQL",
        badgeClassName: "bg-sky-700 text-white",
    },
    dockerfile: {
        label: "Dockerfile",
        badge: "DF",
        badgeClassName: "bg-[#2496ED] text-white",
    },
    docker: {
        label: "Docker",
        badge: "DF",
        badgeClassName: "bg-[#2496ED] text-white",
    },
    rust: {
        label: "Rust",
        badge: "RS",
        badgeClassName: "bg-[#DEA584] text-[#323330]",
    },
    rs: {
        label: "Rust",
        badge: "RS",
        badgeClassName: "bg-[#DEA584] text-[#323330]",
    },
    html: {
        label: "HTML",
        badge: "HTML",
        badgeClassName: "bg-orange-600 text-white",
    },
    css: {
        label: "CSS",
        badge: "CSS",
        badgeClassName: "bg-[#663399] text-white",
    },
    markdown: {
        label: "Markdown",
        badge: "MD",
        badgeClassName: "bg-zinc-500 text-white",
    },
    md: {
        label: "Markdown",
        badge: "MD",
        badgeClassName: "bg-zinc-500 text-white",
    },
    mdx: {
        label: "MDX",
        badge: "MDX",
        badgeClassName: "bg-zinc-700 text-white",
    },
    text: {
        label: "Text",
        badge: "TXT",
        badgeClassName: "bg-muted-foreground/80 text-background",
    },
    plaintext: {
        label: "Text",
        badge: "TXT",
        badgeClassName: "bg-muted-foreground/80 text-background",
    },
    hcl: {
        label: "HCL",
        badge: "HCL",
        badgeClassName: "bg-[#844FBA] text-white",
    },
    terraform: {
        label: "Terraform",
        badge: "TF",
        badgeClassName: "bg-[#844FBA] text-white",
    },
    tf: {
        label: "Terraform",
        badge: "TF",
        badgeClassName: "bg-[#844FBA] text-white",
    },
}

export function resolveCodeBlockLanguage(lang?: string | null): CodeBlockLanguageMeta {
    const key = lang?.trim().toLowerCase()
    if (key && LANGUAGE_MAP[key]) return LANGUAGE_MAP[key]

    if (!key) {
        return LANGUAGE_MAP.text!
    }

    const badge = key.length <= 4 ? key.toUpperCase() : key.slice(0, 4).toUpperCase()
    return {
        label: lang!,
        badge,
        badgeClassName: "bg-muted-foreground/80 text-background",
    }
}
