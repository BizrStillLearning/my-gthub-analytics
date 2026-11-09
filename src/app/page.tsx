import Dashboard from "@/components/Dashboard";

export const metadata = {
    title: "GitHub Language Analytics",
    description: "Analyze your most popular programming languages by repositories and commits.",
};

export default function Home() {
    return (
        <main>
            <Dashboard />
        </main>
    );
}