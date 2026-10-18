import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#090a0f] p-4 text-zinc-100 selection:bg-indigo-500/30 selection:text-white">
            {/* Minimal Monochrome Architectural Ambient Vignette */}
            <div className="pointer-events-none absolute -top-48 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-white/[0.04] via-zinc-800/[0.02] to-transparent blur-[140px]" />
            <div className="relay-grid pointer-events-none fixed inset-0 z-0 opacity-40" />

            {/* Brand Header */}
            <div className="relative z-10 flex flex-col items-center gap-3">
                <Link
                    href="/"
                    className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-700/80 bg-[#13141a] p-3 shadow-xl shadow-black/60 transition-all duration-200 hover:border-zinc-500 hover:bg-[#181a22] hover:scale-105"
                    title="Relay Studio"
                >
                    <ApplicationLogo className="h-full w-full" />
                </Link>
                <div className="text-center">
                    <h1 className="text-lg font-bold tracking-[0.25em] text-white">
                        RELAY
                    </h1>
                    <p className="mt-0.5 text-xs font-medium text-zinc-400">
                        Workspace Studio Platform
                    </p>
                </div>
            </div>

            {/* Main Auth Portal Surface */}
            <div className="relative z-10 mt-6 w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111216] p-7 shadow-2xl shadow-black/80 backdrop-blur-xl sm:p-8">
                {children}
            </div>

            {/* Portal Footer */}
            <div className="relative z-10 mt-6 text-xs text-zinc-500 font-mono">
                Relay Studio
            </div>
        </div>
    );
}
