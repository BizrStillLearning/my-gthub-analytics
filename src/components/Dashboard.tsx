"use client";

import { useState, useRef } from "react";
import { Search, GitCommit, BookMarked, AlertCircle, RefreshCw, Palette, Code, Copy, Check } from "lucide-react";
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

type LanguageStat = { name: string; count: number; value: number; color: string };

const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
    Java: "#b07219", Go: "#00ADD8", "C++": "#f34b7d", C: "#555555",
    Ruby: "#701516", PHP: "#4F5D95", Rust: "#dea584", HTML: "#e34c26",
    CSS: "#563d7c", Vue: "#41b883", Shell: "#89e051", Swift: "#F05138",
    Dart: "#00B4AB", Kotlin: "#A97BFF", "C#": "#178600"
};

const getLangColor = (lang: string) => LANGUAGE_COLORS[lang] || "#" + Math.floor(Math.random()*16777215).toString(16);

const THEMES: Record<string, any> = {
    default: { appBg: "bg-slate-900", cardBg: "bg-slate-800", borderColor: "border-slate-700", textMain: "text-slate-50", textMuted: "text-slate-400", accent: "text-blue-400", accentIcon: "text-blue-400", commitIcon: "text-green-400", btnBg: "bg-blue-600 hover:bg-blue-700 text-white", inputBg: "bg-slate-900", tableHeader: "bg-slate-900", hoverRow: "hover:bg-slate-750/30", hexBg: "#0f172a" },
    synthwave: { appBg: "bg-[#241b2f]", cardBg: "bg-[#2d213f]", borderColor: "border-pink-500/40", textMain: "text-pink-50", textMuted: "text-pink-200/70", accent: "text-cyan-400", accentIcon: "text-fuchsia-400", commitIcon: "text-cyan-400", btnBg: "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white", inputBg: "bg-[#1c1425]", tableHeader: "bg-[#1c1425]", hoverRow: "hover:bg-purple-900/30", hexBg: "#241b2f" },
    dracula: { appBg: "bg-[#282a36]", cardBg: "bg-[#44475a]", borderColor: "border-[#6272a4]", textMain: "text-[#f8f8f2]", textMuted: "text-[#6272a4]", accent: "text-[#ff79c6]", accentIcon: "text-[#bd93f9]", commitIcon: "text-[#50fa7b]", btnBg: "bg-[#bd93f9] hover:bg-[#ff79c6] text-[#282a36] font-semibold", inputBg: "bg-[#282a36]", tableHeader: "bg-[#282a36]", hoverRow: "hover:bg-[#6272a4]/20", hexBg: "#282a36" },
    monokai: { appBg: "bg-[#272822]", cardBg: "bg-[#1e1f1c]", borderColor: "border-[#75715e]", textMain: "text-[#f8f8f2]", textMuted: "text-[#75715e]", accent: "text-[#f92672]", accentIcon: "text-[#f92672]", commitIcon: "text-[#a6e22e]", btnBg: "bg-[#f92672] hover:bg-[#fd5ff0] text-white", inputBg: "bg-[#272822]", tableHeader: "bg-[#272822]", hoverRow: "hover:bg-[#49483e]/40", hexBg: "#272822" },
    github_dark: { appBg: "bg-[#0d1117]", cardBg: "bg-[#161b22]", borderColor: "border-[#30363d]", textMain: "text-[#c9d1d9]", textMuted: "text-[#8b949e]", accent: "text-[#58a6ff]", accentIcon: "text-[#58a6ff]", commitIcon: "text-[#3fb950]", btnBg: "bg-[#238636] hover:bg-[#2ea043] text-white", inputBg: "bg-[#0d1117]", tableHeader: "bg-[#0d1117]", hoverRow: "hover:bg-[#21262d]", hexBg: "#0d1117" },
    github_light: { appBg: "bg-white", cardBg: "bg-slate-50", borderColor: "border-slate-200", textMain: "text-slate-900", textMuted: "text-slate-500", accent: "text-blue-600", accentIcon: "text-blue-600", commitIcon: "text-green-600", btnBg: "bg-blue-600 hover:bg-blue-700 text-white", inputBg: "bg-white", tableHeader: "bg-slate-100", hoverRow: "hover:bg-slate-100", hexBg: "#ffffff" },
    nord: { appBg: "bg-[#2e3440]", cardBg: "bg-[#3b4252]", borderColor: "border-[#4c566a]", textMain: "text-[#eceff4]", textMuted: "text-[#d8dee9]", accent: "text-[#88c0d0]", accentIcon: "text-[#88c0d0]", commitIcon: "text-[#a3be8c]", btnBg: "bg-[#5e81ac] hover:bg-[#81a1c1] text-white", inputBg: "bg-[#2e3440]", tableHeader: "bg-[#2e3440]", hoverRow: "hover:bg-[#434c5e]", hexBg: "#2e3440" },
    tokyonight: { appBg: "bg-[#1a1b26]", cardBg: "bg-[#24283b]", borderColor: "border-[#414868]", textMain: "text-[#c0caf5]", textMuted: "text-[#565f89]", accent: "text-[#7aa2f7]", accentIcon: "text-[#7aa2f7]", commitIcon: "text-[#9ece6a]", btnBg: "bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#1a1b26] font-semibold", inputBg: "bg-[#1a1b26]", tableHeader: "bg-[#1a1b26]", hoverRow: "hover:bg-[#292e42]", hexBg: "#1a1b26" },
    catppuccin_mocha: { appBg: "bg-[#1e1e2e]", cardBg: "bg-[#181825]", borderColor: "border-[#313244]", textMain: "text-[#cdd6f4]", textMuted: "text-[#a6adc8]", accent: "text-[#cba6f7]", accentIcon: "text-[#cba6f7]", commitIcon: "text-[#a6e3a1]", btnBg: "bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] font-semibold", inputBg: "bg-[#11111b]", tableHeader: "bg-[#11111b]", hoverRow: "hover:bg-[#313244]/50", hexBg: "#1e1e2e" },
    gruvbox: { appBg: "bg-[#282828]", cardBg: "bg-[#3c3836]", borderColor: "border-[#504945]", textMain: "text-[#ebdbb2]", textMuted: "text-[#a89984]", accent: "text-[#fe8019]", accentIcon: "text-[#fe8019]", commitIcon: "text-[#b8bb26]", btnBg: "bg-[#d3869b] hover:bg-[#b16286] text-[#282828] font-bold", inputBg: "bg-[#282828]", tableHeader: "bg-[#282828]", hoverRow: "hover:bg-[#504945]", hexBg: "#282828" },
    onedark: { appBg: "bg-[#282c34]", cardBg: "bg-[#21252b]", borderColor: "border-[#3b4048]", textMain: "text-[#abb2bf]", textMuted: "text-[#5c6370]", accent: "text-[#61afef]", accentIcon: "text-[#61afef]", commitIcon: "text-[#98c379]", btnBg: "bg-[#61afef] hover:bg-[#528bff] text-[#282c34] font-semibold", inputBg: "bg-[#282c34]", tableHeader: "bg-[#282c34]", hoverRow: "hover:bg-[#2c313a]", hexBg: "#282c34" },
    solarized_dark: { appBg: "bg-[#002b36]", cardBg: "bg-[#073642]", borderColor: "border-[#586e75]", textMain: "text-[#839496]", textMuted: "text-[#586e75]", accent: "text-[#268bd2]", accentIcon: "text-[#268bd2]", commitIcon: "text-[#859900]", btnBg: "bg-[#2aa198] hover:bg-[#268bd2] text-[#002b36] font-semibold", inputBg: "bg-[#002b36]", tableHeader: "bg-[#002b36]", hoverRow: "hover:bg-[#002b36]", hexBg: "#002b36" },
    solarized_light: { appBg: "bg-[#fdf6e3]", cardBg: "bg-[#eee8d5]", borderColor: "border-[#93a1a1]", textMain: "text-[#657b83]", textMuted: "text-[#93a1a1]", accent: "text-[#268bd2]", accentIcon: "text-[#268bd2]", commitIcon: "text-[#859900]", btnBg: "bg-[#2aa198] hover:bg-[#268bd2] text-[#fdf6e3] font-semibold", inputBg: "bg-[#fdf6e3]", tableHeader: "bg-[#fdf6e3]", hoverRow: "hover:bg-[#e0d6b8]", hexBg: "#fdf6e3" },
    radical: { appBg: "bg-[#141321]", cardBg: "bg-[#1e1c2e]", borderColor: "border-[#fe428e]/50", textMain: "text-[#a9fef7]", textMuted: "text-[#fe428e]", accent: "text-[#fe428e]", accentIcon: "text-[#fe428e]", commitIcon: "text-[#f8d847]", btnBg: "bg-gradient-to-r from-[#fe428e] to-[#f8d847] hover:opacity-90 text-[#141321] font-bold", inputBg: "bg-[#141321]", tableHeader: "bg-[#141321]", hoverRow: "hover:bg-[#2a2640]", hexBg: "#141321" },
    merko: { appBg: "bg-[#0a0f0b]", cardBg: "bg-[#111c15]", borderColor: "border-[#abd200]/30", textMain: "text-[#b7d364]", textMuted: "text-[#68b587]", accent: "text-[#abd200]", accentIcon: "text-[#abd200]", commitIcon: "text-[#b7d364]", btnBg: "bg-[#abd200] hover:bg-[#8da800] text-[#0a0f0b] font-bold", inputBg: "bg-[#0a0f0b]", tableHeader: "bg-[#0a0f0b]", hoverRow: "hover:bg-[#1a2b20]", hexBg: "#0a0f0b" },
    vue_dark: { appBg: "bg-[#273849]", cardBg: "bg-[#1e2936]", borderColor: "border-[#41b883]/30", textMain: "text-[#fff]", textMuted: "text-[#8a99a8]", accent: "text-[#41b883]", accentIcon: "text-[#41b883]", commitIcon: "text-[#41b883]", btnBg: "bg-[#41b883] hover:bg-[#33a06f] text-white font-bold", inputBg: "bg-[#273849]", tableHeader: "bg-[#273849]", hoverRow: "hover:bg-[#2c3e50]", hexBg: "#273849" },
    high_contrast: { appBg: "bg-black", cardBg: "bg-black", borderColor: "border-white", textMain: "text-white", textMuted: "text-gray-300", accent: "text-yellow-400", accentIcon: "text-yellow-400", commitIcon: "text-green-400", btnBg: "bg-white text-black font-bold hover:bg-gray-200", inputBg: "bg-black", tableHeader: "bg-black", hoverRow: "hover:bg-gray-900", hexBg: "#000000" },
    cyberpunk: { appBg: "bg-[#0f0f16]", cardBg: "bg-[#1a1a24]", borderColor: "border-[#fcee0a]/50", textMain: "text-[#fcee0a]", textMuted: "text-[#00ff9f]", accent: "text-[#ff003c]", accentIcon: "text-[#ff003c]", commitIcon: "text-[#00ff9f]", btnBg: "bg-[#fcee0a] hover:bg-[#ff003c] hover:text-white text-black font-bold", inputBg: "bg-[#0f0f16]", tableHeader: "bg-[#0f0f16]", hoverRow: "hover:bg-[#252533]", hexBg: "#0f0f16" },
    nightowl: { appBg: "bg-[#011627]", cardBg: "bg-[#0b2942]", borderColor: "border-[#5f7e97]", textMain: "text-[#d6deeb]", textMuted: "text-[#5f7e97]", accent: "text-[#82aaff]", accentIcon: "text-[#82aaff]", commitIcon: "text-[#c3e88d]", btnBg: "bg-[#82aaff] hover:bg-[#5f7e97] text-[#011627] font-bold", inputBg: "bg-[#011627]", tableHeader: "bg-[#011627]", hoverRow: "hover:bg-[#123955]", hexBg: "#011627" },
    aura: { appBg: "bg-[#15141b]", cardBg: "bg-[#1d1b26]", borderColor: "border-[#a277ff]/30", textMain: "text-[#edecee]", textMuted: "text-[#6b6973]", accent: "text-[#a277ff]", accentIcon: "text-[#a277ff]", commitIcon: "text-[#61ffca]", btnBg: "bg-[#a277ff] hover:bg-[#61ffca] hover:text-[#15141b] text-white font-bold", inputBg: "bg-[#15141b]", tableHeader: "bg-[#15141b]", hoverRow: "hover:bg-[#282635]", hexBg: "#15141b" },
    rose_pine: { appBg: "bg-[#191724]", cardBg: "bg-[#1f1d2e]", borderColor: "border-[#44415a]", textMain: "text-[#e0def4]", textMuted: "text-[#908caa]", accent: "text-[#c4a7e7]", accentIcon: "text-[#c4a7e7]", commitIcon: "text-[#9ccfd8]", btnBg: "bg-[#ebbcba] hover:bg-[#31748f] text-[#191724] font-bold", inputBg: "bg-[#191724]", tableHeader: "bg-[#191724]", hoverRow: "hover:bg-[#26233a]", hexBg: "#191724" },
    ayu_mirage: { appBg: "bg-[#1f2430]", cardBg: "bg-[#171b24]", borderColor: "border-[#242936]", textMain: "text-[#cbccc6]", textMuted: "text-[#707a8c]", accent: "text-[#ffcc66]", accentIcon: "text-[#ffcc66]", commitIcon: "text-[#a6cc70]", btnBg: "bg-[#ffcc66] hover:bg-[#a6cc70] text-[#1f2430] font-bold", inputBg: "bg-[#1f2430]", tableHeader: "bg-[#1f2430]", hoverRow: "hover:bg-[#242936]", hexBg: "#1f2430" },
    midnight: { appBg: "bg-[#000000]", cardBg: "bg-[#0a0a0a]", borderColor: "border-[#333333]", textMain: "text-[#ffffff]", textMuted: "text-[#888888]", accent: "text-[#ffffff]", accentIcon: "text-[#ffffff]", commitIcon: "text-[#cccccc]", btnBg: "bg-[#ffffff] hover:bg-[#cccccc] text-[#000000] font-bold", inputBg: "bg-[#000000]", tableHeader: "bg-[#000000]", hoverRow: "hover:bg-[#111111]", hexBg: "#000000" }
};

export default function Dashboard() {
    const [username, setUsername] = useState("");
    const [includeForks, setIncludeForks] = useState(false);
    const [theme, setTheme] = useState("default");
    const [showBorder, setShowBorder] = useState(true);
    const [status, setStatus] = useState<"idle" | "loading-user" | "loading-commits" | "done" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const [profile, setProfile] = useState<any>(null);
    const [repoStats, setRepoStats] = useState<LanguageStat[]>([]);
    const [commitStats, setCommitStats] = useState<LanguageStat[]>([]);
    const [totalAnalyzedCommits, setTotalAnalyzedCommits] = useState(0);
    const [totalValidRepos, setTotalValidRepos] = useState(0);

    const [copiedType, setCopiedType] = useState<"markdown" | "html" | null>(null);

    const th = THEMES[theme];
    const cardClass = `${th.cardBg} p-6 rounded-xl border transition-all duration-300 ${showBorder ? th.borderColor : 'border-transparent shadow-lg'}`;

    const startAnalysis = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!username.trim()) return;

        setStatus("loading-user");
        setErrorMsg("");
        setRepoStats([]);
        setCommitStats([]);
        setTotalAnalyzedCommits(0);
        setTotalValidRepos(0);

        try {
            const userRes = await fetch(`/api/github/user?username=${username}&includeForks=${includeForks}`);
            const userData = await userRes.json();

            if (!userRes.ok) throw new Error(userData.error || "Failed to fetch user");
            setProfile(userData.profile);

            const validRepos = userData.repos.filter((repo: any) => {
                const lang = repo.language;
                return lang && lang.toLowerCase() !== "unknown" && lang.toLowerCase() !== "other";
            });

            setTotalValidRepos(validRepos.length);

            const rStats: Record<string, number> = {};
            validRepos.forEach((repo: any) => { rStats[repo.language] = (rStats[repo.language] || 0) + 1; });

            const formattedRepoStats = Object.keys(rStats)
                .map(lang => ({ name: lang, count: rStats[lang], value: rStats[lang], color: getLangColor(lang) }))
                .sort((a, b) => b.count - a.count);

            setRepoStats(formattedRepoStats);
            setStatus("loading-commits");

            const cStats: Record<string, number> = {};
            let commitsCount = 0;

            const BATCH_SIZE = 5;
            for (let i = 0; i < validRepos.length; i += BATCH_SIZE) {
                const batch = validRepos.slice(i, i + BATCH_SIZE);
                const promises = batch.map(async (repo: any) => {
                    try {
                        const commitRes = await fetch(`/api/github/commits?owner=${userData.profile.login}&repo=${repo.name}&author=${userData.profile.login}`);
                        const commitData = await commitRes.json();
                        return { lang: repo.language, count: commitData.count || 0 };
                    } catch { return { lang: repo.language, count: 0 }; }
                });
                const results = await Promise.all(promises);
                results.forEach(res => {
                    cStats[res.lang] = (cStats[res.lang] || 0) + res.count;
                    commitsCount += res.count;
                });
            }

            const formattedCommitStats = Object.keys(cStats)
                .map(lang => ({ name: lang, count: cStats[lang], value: cStats[lang], color: getLangColor(lang) }))
                .filter(stat => stat.count > 0)
                .sort((a, b) => b.count - a.count);

            setCommitStats(formattedCommitStats);
            setTotalAnalyzedCommits(commitsCount);
            setStatus("done");
        } catch (err: any) {
            setErrorMsg(err.message);
            setStatus("error");
        }
    };

    const handleCopy = (text: string, type: "markdown" | "html") => {
        navigator.clipboard.writeText(text);
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 2000);
    };

    const isLoading = status === "loading-user" || status === "loading-commits";

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.vercel.app";
    const apiUrl = `${baseUrl}/api/svg?username=${username}&theme=${theme}&border=${showBorder}`;

    const markdownSnippet = `[![GitHub Language Analytics](${apiUrl})](https://github.com/${username})`;
    const htmlSnippet = `<a href="https://github.com/${username}">\n  <img src="${apiUrl}" alt="GitHub Language Analytics" width="100%" />\n</a>`;

    return (
        <div className={`min-h-screen ${th.appBg} ${th.textMain} font-sans transition-colors duration-500`}>
            <div className="max-w-6xl mx-auto p-6 space-y-8 py-10">
                <div className="flex flex-wrap justify-end items-center gap-6 text-sm mb-4">
                    <label className={`flex items-center gap-2 cursor-pointer ${th.textMuted}`}>
                        <Palette className="w-4 h-4" />
                        <select
                            className={`bg-transparent outline-none cursor-pointer font-medium ${th.accent} capitalize`}
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            {Object.keys(THEMES).map((themeKey) => (
                                <option key={themeKey} value={themeKey} className="bg-slate-800 text-white">
                                    {themeKey.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={`flex items-center gap-2 cursor-pointer ${th.textMuted} hover:${th.textMain}`}>
                        <input type="checkbox" checked={showBorder} onChange={(e) => setShowBorder(e.target.checked)} className="rounded cursor-pointer" />
                        Show Borders
                    </label>
                </div>

                <div className={`${cardClass} flex flex-col md:flex-row justify-between items-center gap-4`}>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <svg className={`w-8 h-8 fill-current ${th.textMain}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            GitHub Language Analytics
                        </h1>
                        <p className={`${th.textMuted} text-sm mt-1`}>Discover your most prominent programming languages</p>
                    </div>
                    <form onSubmit={startAnalysis} className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex flex-col gap-2">
                            <div className="relative">
                                <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${th.textMuted}`} />
                                <input type="text" placeholder="GitHub Username" value={username} onChange={(e) => setUsername(e.target.value)} className={`pl-10 pr-4 py-2 ${th.inputBg} border ${showBorder ? th.borderColor : 'border-transparent'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-colors`} required />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className={`h-10 px-6 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50 self-start ${th.btnBg}`}>
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Analyze"}
                        </button>
                    </form>
                </div>

                {status === "error" && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-6 h-6" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                {status === "done" && profile && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className={`${cardClass} flex items-center gap-4 col-span-1 md:col-span-2`}>
                                <img src={profile.avatar_url} alt={profile.login} className="w-16 h-16 rounded-full" />
                                <div>
                                    <h2 className="text-xl font-bold">{profile.name || profile.login}</h2>
                                    <a href={profile.html_url} target="_blank" rel="noreferrer" className={`${th.accent} text-sm hover:underline`}>@{profile.login}</a>
                                </div>
                            </div>
                            <div className={`${cardClass} flex flex-col justify-center`}>
                                <div className={`flex items-center gap-2 ${th.textMuted} mb-1`}><BookMarked className="w-4 h-4" /> Valid Repositories</div>
                                <p className="text-3xl font-bold">{totalValidRepos}</p>
                            </div>
                            <div className={`${cardClass} flex flex-col justify-center`}>
                                <div className={`flex items-center gap-2 ${th.textMuted} mb-1`}><GitCommit className="w-4 h-4" /> Analyzed Commits</div>
                                <p className="text-3xl font-bold">{totalAnalyzedCommits.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 -m-4 rounded-2xl ${th.appBg}`}>
                            <div className={cardClass}>
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><BookMarked className={`w-5 h-5 ${th.accentIcon}`} />Language by Repository</h3>
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={repoStats} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={5} cornerRadius={8} stroke="none">
                                                {repoStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} formatter={(value: number) => [`${value} Repositories`, 'Count']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                    {repoStats.slice(0, 6).map(stat => (
                                        <span key={stat.name} className={`text-xs px-2.5 py-1.5 rounded-full ${th.inputBg} border ${showBorder ? th.borderColor : 'border-transparent'} flex items-center gap-2`}>
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                                            {stat.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={cardClass}>
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><GitCommit className={`w-5 h-5 ${th.commitIcon}`} />Language by Commits</h3>
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={commitStats} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={5} cornerRadius={8} stroke="none">
                                                {commitStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} formatter={(value: number) => [`${value.toLocaleString()} Commits`, 'Count']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                    {commitStats.slice(0, 6).map(stat => (
                                        <span key={stat.name} className={`text-xs px-2.5 py-1.5 rounded-full ${th.inputBg} border ${showBorder ? th.borderColor : 'border-transparent'} flex items-center gap-2`}>
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                                            {stat.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`${cardClass} bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30`}>
                            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-blue-400">
                                        <Code className="w-5 h-5" /> Dynamic Real-time Badge
                                    </h3>
                                    <p className={`text-sm ${th.textMuted} mt-1`}>
                                        Copy the URL below into your GitHub README. The SVG image is dynamically generated and updates automatically.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div className={`${th.inputBg} p-4 rounded-lg border ${th.borderColor} relative group`}>
                                    <p className="text-xs font-semibold text-slate-500 mb-2">MARKDOWN (README.md)</p>
                                    <code className="text-sm text-green-400 break-all">{markdownSnippet}</code>
                                    <button onClick={() => handleCopy(markdownSnippet, "markdown")} className="absolute top-3 right-3 p-2 bg-slate-800 rounded-md border border-slate-700 hover:bg-slate-700 transition">
                                        {copiedType === "markdown" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                                    </button>
                                </div>
                                <div className={`${th.inputBg} p-4 rounded-lg border ${th.borderColor} relative group`}>
                                    <p className="text-xs font-semibold text-slate-500 mb-2">HTML (README.md)</p>
                                    <code className="text-sm text-blue-400 break-all">{htmlSnippet}</code>
                                    <button onClick={() => handleCopy(htmlSnippet, "html")} className="absolute top-3 right-3 p-2 bg-slate-800 rounded-md border border-slate-700 hover:bg-slate-700 transition">
                                        {copiedType === "html" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
