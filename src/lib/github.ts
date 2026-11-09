const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const getHeaders = () => {
    const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
    };
    if (GITHUB_TOKEN) {
        headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }
    return headers;
};

export async function getUserProfile(username: string) {
    const res = await fetch(`https://api.github.com/users/${username}`, {
        headers: getHeaders(),
    });
    if (!res.ok) {
        if (res.status === 404) throw new Error("User not found");
        if (res.status === 403) throw new Error("API Rate limit exceeded. Please add GITHUB_TOKEN.");
        throw new Error("Failed to fetch user profile");
    }
    return res.json();
}

export async function getUserRepos(username: string, includeForks: boolean) {
    let page = 1;
    let allRepos: any[] = [];

    while (true) {
        const res = await fetch(
            `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=pushed`,
            { headers: getHeaders() }
        );

        if (!res.ok) throw new Error("Failed to fetch repositories");

        const data = await res.json();
        if (data.length === 0) break;

        allRepos = [...allRepos, ...data];
        if (data.length < 100) break;
        page++;
    }

    if (!includeForks) {
        allRepos = allRepos.filter((repo) => !repo.fork);
    }

    return allRepos;
}

export async function getRepoCommitCount(owner: string, repo: string, author: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?author=${author}&per_page=1`;
    const res = await fetch(url, { headers: getHeaders() });

    if (res.status === 409) return 0;
    if (!res.ok) return 0;

    const linkHeader = res.headers.get("link");
    if (linkHeader) {
        const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
        if (match) return parseInt(match[1], 10);
    }

    const data = await res.json();
    return data.length;
}