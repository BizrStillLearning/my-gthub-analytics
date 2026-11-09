import { NextResponse } from "next/server";
import { getUserProfile, getUserRepos, getRepoCommitCount } from "@/lib/github";

const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
    Java: "#b07219", Go: "#00ADD8", "C++": "#f34b7d", C: "#555555",
    Ruby: "#701516", PHP: "#4F5D95", Rust: "#dea584", HTML: "#e34c26",
    CSS: "#563d7c", Vue: "#41b883", Shell: "#89e051", Swift: "#F05138",
    Dart: "#00B4AB", Kotlin: "#A97BFF", "C#": "#178600"
};

const getLangColor = (lang: string) => LANGUAGE_COLORS[lang] || "#94a3b8";

const THEMES: Record<string, any> = {
    default: { bg: "#0f172a", card: "#1e293b", textMain: "#f8fafc", textMuted: "#94a3b8", border: "#334155" },
    synthwave: { bg: "#241b2f", card: "#2d213f", textMain: "#fdf8ff", textMuted: "#b49bcf", border: "#ec4899" },
    dracula: { bg: "#282a36", card: "#44475a", textMain: "#f8f8f2", textMuted: "#6272a4", border: "#6272a4" },
    monokai: { bg: "#272822", card: "#1e1f1c", textMain: "#f8f8f2", textMuted: "#75715e", border: "#75715e" },
    tokyonight: { bg: "#1a1b26", card: "#24283b", textMain: "#c0caf5", textMuted: "#565f89", border: "#414868" },
    github_dark: { bg: "#0d1117", card: "#161b22", textMain: "#c9d1d9", textMuted: "#8b949e", border: "#30363d" },
    github_light: { bg: "#ffffff", card: "#f8fafc", textMain: "#0f172a", textMuted: "#64748b", border: "#e2e8f0" },
    catppuccin_mocha: { bg: "#1e1e2e", card: "#181825", textMain: "#cdd6f4", textMuted: "#a6adc8", border: "#313244" },
    gruvbox: { bg: "#282828", card: "#3c3836", textMain: "#ebdbb2", textMuted: "#a89984", border: "#504945" },
    onedark: { bg: "#282c34", card: "#21252b", textMain: "#abb2bf", textMuted: "#5c6370", border: "#3b4048" },
    solarized_dark: { bg: "#002b36", card: "#073642", textMain: "#839496", textMuted: "#586e75", border: "#586e75" },
    solarized_light: { bg: "#fdf6e3", card: "#eee8d5", textMain: "#657b83", textMuted: "#93a1a1", border: "#93a1a1" },
    radical: { bg: "#141321", card: "#1e1c2e", textMain: "#a9fef7", textMuted: "#fe428e", border: "#fe428e" },
    merko: { bg: "#0a0f0b", card: "#111c15", textMain: "#b7d364", textMuted: "#68b587", border: "#abd200" },
    vue_dark: { bg: "#273849", card: "#1e2936", textMain: "#fff", textMuted: "#8a99a8", border: "#41b883" },
    high_contrast: { bg: "#000000", card: "#000000", textMain: "#ffffff", textMuted: "#cccccc", border: "#ffffff" },
    cyberpunk: { bg: "#0f0f16", card: "#1a1a24", textMain: "#fcee0a", textMuted: "#00ff9f", border: "#fcee0a" },
    nightowl: { bg: "#011627", card: "#0b2942", textMain: "#d6deeb", textMuted: "#5f7e97", border: "#5f7e97" },
    aura: { bg: "#15141b", card: "#1d1b26", textMain: "#edecee", textMuted: "#6b6973", border: "#a277ff" },
    rose_pine: { bg: "#191724", card: "#1f1d2e", textMain: "#e0def4", textMuted: "#908caa", border: "#44415a" },
    ayu_mirage: { bg: "#1f2430", card: "#171b24", textMain: "#cbccc6", textMuted: "#707a8c", border: "#242936" },
    midnight: { bg: "#000000", card: "#0a0a0a", textMain: "#ffffff", textMuted: "#888888", border: "#333333" }
};

function getCoordinatesForPercent(percent: number, radius: number) {
    const x = Math.cos(2 * Math.PI * percent) * radius;
    const y = Math.sin(2 * Math.PI * percent) * radius;
    return [x, y];
}

function generateDonutPath(percentValue: number, cumulativePercent: number, radius: number) {
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent, radius);
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent + percentValue, radius);
    const largeArcFlag = percentValue > 0.5 ? 1 : 0;
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const themeKey = searchParams.get("theme") || "default";
    const showBorder = searchParams.get("border") !== "false";

    if (!username) return new NextResponse("Username required", { status: 400 });

    const th = THEMES[themeKey] || THEMES["default"];

    try {
        const profile = await getUserProfile(username);
        const repos = await getUserRepos(username, false);

        const validRepos = repos.filter((repo: any) => repo.language && repo.language.toLowerCase() !== "unknown" && repo.language.toLowerCase() !== "other");

        const rStats: Record<string, number> = {};
        validRepos.forEach((repo: any) => { rStats[repo.language] = (rStats[repo.language] || 0) + 1; });
        const repoData = Object.keys(rStats).map(lang => ({ name: lang, count: rStats[lang] })).sort((a, b) => b.count - a.count).slice(0, 6);
        const totalRepos = repoData.reduce((acc, curr) => acc + curr.count, 0);

        const cStats: Record<string, number> = {};
        const batchSize = 10;
        for (let i = 0; i < validRepos.length; i += batchSize) {
            const batch = validRepos.slice(i, i + batchSize);
            await Promise.all(batch.map(async (repo: any) => {
                try {
                    const count = await getRepoCommitCount(profile.login, repo.name, profile.login);
                    if (count > 0) cStats[repo.language] = (cStats[repo.language] || 0) + count;
                } catch (e) {}
            }));
        }
        const commitData = Object.keys(cStats).map(lang => ({ name: lang, count: cStats[lang] })).sort((a, b) => b.count - a.count).slice(0, 6);
        const totalCommits = commitData.reduce((acc, curr) => acc + curr.count, 0);

        const renderDonut = (data: any[], total: number, cx: number, cy: number) => {
            let cumulativePercent = -0.25;
            return data.map(slice => {
                const percent = slice.count / total;
                const path = generateDonutPath(percent === 1 ? 0.999 : percent - 0.015, cumulativePercent, 60);
                cumulativePercent += percent;
                return `<path d="${path}" fill="none" stroke="${getLangColor(slice.name)}" stroke-width="25" stroke-linecap="round" transform="translate(${cx}, ${cy})" />`;
            }).join("\n");
        };

        const renderLegend = (data: any[], startX: number, startY: number) => {
            return data.map((slice, i) => {
                const x = startX + (i % 3) * 110;
                const y = startY + Math.floor(i / 3) * 30;
                return `
          <g transform="translate(${x}, ${y})">
            <rect x="0" y="0" width="10" height="10" rx="5" fill="${getLangColor(slice.name)}" />
            <text x="18" y="9" font-family="Segoe UI, Ubuntu, sans-serif" font-size="12" fill="${th.textMain}">${slice.name}</text>
          </g>
        `;
            }).join("\n");
        };

        const borderAttr = showBorder ? `stroke="${th.border}" stroke-width="1"` : "";

        const svg = `
      <svg width="850" height="380" viewBox="0 0 850 380" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
          .title { font-family: "Segoe UI", Ubuntu, sans-serif; font-size: 16px; font-weight: bold; fill: ${th.textMain}; }
        </style>
        
        <rect width="850" height="380" fill="${th.bg}" rx="10" />
        
        <rect x="20" y="20" width="395" height="340" fill="${th.card}" rx="8" ${borderAttr} />
        <text x="45" y="55" class="title">Language by Repository</text>
        ${renderDonut(repoData, totalRepos, 217.5, 170)}
        ${renderLegend(repoData, 60, 270)}

        <rect x="435" y="20" width="395" height="340" fill="${th.card}" rx="8" ${borderAttr} />
        <text x="460" y="55" class="title">Language by Commits</text>
        ${renderDonut(commitData, totalCommits, 632.5, 170)}
        ${renderLegend(commitData, 475, 270)}
      </svg>
    `;

        return new NextResponse(svg, {
            headers: {
                "Content-Type": "image/svg+xml",
                "Cache-Control": "public, max-age=43200, s-maxage=43200, stale-while-revalidate=86400",
            },
        });

    } catch (error: any) {
        return new NextResponse(`<svg width="850" height="380" xmlns="http://www.w3.org/2000/svg"><text x="20" y="40" fill="red">Error: ${error.message}</text></svg>`, {
            headers: { "Content-Type": "image/svg+xml" }
        });
    }
}