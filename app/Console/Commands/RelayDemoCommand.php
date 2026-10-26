<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Cycle;
use App\Models\User;
use App\Models\Workspace;
use Database\Seeders\AtlasDesktopDemoSeeder;
use Illuminate\Console\Command;

final class RelayDemoCommand extends Command
{
    protected $signature = 'relay:demo 
                            {--user= : Username or email of the user to assign as owner}
                            {--fresh : Remove existing Atlas Desktop workspace and re-seed from scratch}';

    protected $description = 'Seed the realistic Atlas Desktop engineering team demo workspace (28+ issues, 5 areas, 3 cycles)';

    public function handle(): int
    {
        $this->components->info('Seeding Atlas Desktop Commercial Demo Workspace...');

        if ($this->option('fresh')) {
            $existing = Workspace::query()->where('slug', 'atlas-desktop')->first();
            if ($existing) {
                $this->components->warn('Removing existing Atlas Desktop workspace for fresh seed...');
                // Delete associated requests, areas, cycles
                $existing->requests()->forceDelete();
                $existing->areas()->delete();
                $existing->invitations()->delete();
                $existing->audits()->delete();
                $existing->delete();
            }
        }

        $userIdentifier = $this->option('user');
        $user = null;
        if ($userIdentifier) {
            $user = User::query()
                ->where('username', $userIdentifier)
                ->orWhere('email', $userIdentifier)
                ->first();

            if (! $user) {
                $this->components->error("User '{$userIdentifier}' not found.");

                return self::FAILURE;
            }
        } else {
            $user = User::query()->where('username', 'sarah')->first()
                ?? User::query()->where('active', true)->first();
        }

        $seeder = new AtlasDesktopDemoSeeder;
        $workspace = $seeder->run(user: $user);

        $areas = $workspace->areas()->get();
        $cycles = Cycle::query()->where('workspace_id', $workspace->id)->orderBy('number')->get();
        $totalRequests = $workspace->requests()->count();
        $doneRequests = $workspace->requests()->where('status', 'done')->count();
        $doingRequests = $workspace->requests()->where('status', 'doing')->count();
        $reviewRequests = $workspace->requests()->where('status', 'review')->count();
        $blockedRequests = $workspace->requests()->where('is_blocked', true)->count();
        $totalPoints = $workspace->requests()->sum('story_points');

        $this->newLine();
        $this->components->twoColumnDetail('Workspace', "<fg=bright-white;options=bold>{$workspace->name}</> (<fg=gray>{$workspace->slug}</>)");
        $this->components->twoColumnDetail('Owner', "<fg=cyan>@{$workspace->owner?->username}</> ({$workspace->owner?->name})");
        $this->components->twoColumnDetail('Engineering Areas', "<fg=green>{$areas->count()} areas</>");
        $this->components->twoColumnDetail('Sprint Cycles', "<fg=green>{$cycles->count()} cycles</> (Cycle 12, Cycle 13, Cycle 14)");
        $this->components->twoColumnDetail('Total Engineering Tickets', "<fg=bright-white;options=bold>{$totalRequests}</> ({$totalPoints} story points)");
        $this->components->twoColumnDetail('Active Work / Blockers', "<fg=yellow>{$doingRequests} in progress</>, <fg=blue>{$reviewRequests} in review</>, <fg=red>{$blockedRequests} blocked</>");
        $this->newLine();

        $this->components->bulletList([
            'Core Runtime (Rust / C++) · SIMD escape sequence parser, memory limits, eBPF probes',
            'UI Shell & Renderer (React / WebGL) · WebGL2 glyph atlas, Retina scaling, 120Hz physics',
            'Extension & Plugin Host · Wasmtime sandbox, IPC backpressure, LSP integration',
            'Cloud Sync & Collaboration · CRDT state vectors, WebSocket jitter, P2P WebRTC channels',
            'Security & Keyring · Hardware PKCS#11 YubiKey, Secure Enclave, Secret Redactor',
        ]);

        $this->newLine();
        $this->components->info('Atlas Desktop demo workspace is live! Log in and switch to "Atlas Desktop" to test.');

        return self::SUCCESS;
    }
}
