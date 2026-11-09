import { NextResponse } from "next/server";
import { getUserProfile, getUserRepos } from "@/lib/github";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const includeForks = searchParams.get("includeForks") === "true";

    if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });

    try {
        const profile = await getUserProfile(username);
        const repos = await getUserRepos(username, includeForks);

        return NextResponse.json({ profile, repos });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}