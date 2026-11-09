import { NextResponse } from "next/server";
import { getRepoCommitCount } from "@/lib/github";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const author = searchParams.get("author");

    if (!owner || !repo || !author) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    try {
        const count = await getRepoCommitCount(owner, repo, author);
        return NextResponse.json({ count });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}