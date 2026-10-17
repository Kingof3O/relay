<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Redis;
use Throwable;

final class RelayDoctorCommand extends Command
{
    protected $signature = 'relay:doctor';

    protected $description = 'Run comprehensive deployment, environment, and stack diagnostics for Relay Studio';

    /**
     * @var array<int, array{component: string, check: string, status: string, details: string}>
     */
    private array $results = [];

    private int $passCount = 0;

    private int $warnCount = 0;

    private int $failCount = 0;

    public function handle(): int
    {
        $this->displayBanner();

        $this->checkPhpVersion();
        $this->checkPhpExtensions();
        $this->checkDatabaseConnectivity();
        $this->checkCacheConnectivity();
        $this->checkDirectoryPermissions();
        $this->checkFrontendBuildAssets();
        $this->checkSecurityConfiguration();

        $this->renderResultsTable();

        return $this->failCount === 0 ? self::SUCCESS : self::FAILURE;
    }

    private function displayBanner(): void
    {
        $this->line('<fg=cyan;options=bold>====================================================================</>');
        $this->line('<fg=cyan;options=bold>              RELAY STUDIO SYSTEM & DEPLOYMENT DOCTOR               </>');
        $this->line('<fg=cyan;options=bold>====================================================================</>');
        $this->line('<fg=gray>Verifying environment prerequisites, system extensions, and services...</>');
        $this->newLine();
    }

    private function checkPhpVersion(): void
    {
        $version = PHP_VERSION;
        $isSupported = version_compare($version, '8.2.0', '>=');

        if ($isSupported) {
            $this->addResult('Runtime', 'PHP Version', 'PASS', "v{$version} (>= 8.2.0 supported)");
        } else {
            $this->addResult('Runtime', 'PHP Version', 'FAIL', "v{$version} detected. Relay requires PHP >= 8.2.0");
        }
    }

    private function checkPhpExtensions(): void
    {
        $requiredExtensions = [
            'pdo' => 'Database abstraction layer',
            'mbstring' => 'Multibyte string processing',
            'gd' => 'Image processing & thumbnails',
            'zip' => 'Archive processing & export packaging',
            'bcmath' => 'Arbitrary precision arithmetic',
            'curl' => 'HTTP client & external integrations',
            'json' => 'JSON payload serialization',
            'fileinfo' => 'MIME type identification for media pipeline',
        ];

        foreach ($requiredExtensions as $ext => $description) {
            if (extension_loaded($ext)) {
                $this->addResult('Extension', "ext-{$ext}", 'PASS', "Loaded ({$description})");
            } else {
                $this->addResult('Extension', "ext-{$ext}", 'FAIL', "Missing required extension: {$description}");
            }
        }

        // Database-specific driver check
        $defaultDb = config('database.default', 'mysql');
        $driverMap = [
            'mysql' => 'pdo_mysql',
            'pgsql' => 'pdo_pgsql',
            'sqlite' => 'pdo_sqlite',
        ];
        $expectedExt = $driverMap[$defaultDb] ?? 'pdo';
        if (extension_loaded($expectedExt)) {
            $this->addResult('Extension', "ext-{$expectedExt}", 'PASS', "Loaded for default {$defaultDb} driver");
        } else {
            $this->addResult('Extension', "ext-{$expectedExt}", 'WARN', "Driver extension not loaded for {$defaultDb}");
        }

        // Redis extension check
        if (extension_loaded('redis')) {
            $this->addResult('Extension', 'ext-redis', 'PASS', 'Loaded (phpredis)');
        } else {
            $isRedisUsed = config('cache.default') === 'redis' || config('queue.default') === 'redis';
            $status = $isRedisUsed ? 'FAIL' : 'WARN';
            $this->addResult('Extension', 'ext-redis', $status, 'Not loaded (required only when CACHE_STORE/QUEUE_CONNECTION is redis)');
        }
    }

    private function checkDatabaseConnectivity(): void
    {
        try {
            $pdo = DB::connection()->getPdo();
            $driver = DB::connection()->getDriverName();
            $dbName = DB::connection()->getDatabaseName();
            $serverVersion = $pdo->getAttribute(\PDO::ATTR_SERVER_VERSION);

            $this->addResult('Database', 'Connection', 'PASS', "{$driver} (db: {$dbName}, server: {$serverVersion})");

            $hasMigrations = Schema::hasTable('migrations');
            if ($hasMigrations) {
                $count = DB::table('migrations')->count();
                $this->addResult('Database', 'Migrations', 'PASS', "Verified ({$count} migrations executed)");
            } else {
                $this->addResult('Database', 'Migrations', 'WARN', 'Migrations table not found. Run "php artisan migrate"');
            }
        } catch (Throwable $e) {
            $this->addResult('Database', 'Connection', 'FAIL', 'Connection failed: '.$e->getMessage());
        }
    }

    private function checkCacheConnectivity(): void
    {
        $cacheDriver = config('cache.default', 'file');

        try {
            $testKey = '_relay_doctor_healthcheck_'.uniqid();
            Cache::store()->put($testKey, 'ok', 10);
            $retrieved = Cache::store()->get($testKey);
            Cache::store()->forget($testKey);

            if ($retrieved === 'ok') {
                $this->addResult('Cache', "Driver [{$cacheDriver}]", 'PASS', 'Read/write test passed');
            } else {
                $this->addResult('Cache', "Driver [{$cacheDriver}]", 'FAIL', 'Cache store read did not match written value');
            }
        } catch (Throwable $e) {
            $this->addResult('Cache', "Driver [{$cacheDriver}]", 'FAIL', 'Cache store test failed: '.$e->getMessage());
        }

        // Test Redis connection if redis extension is loaded
        if (extension_loaded('redis')) {
            $redisHost = (string) config('database.redis.default.host', '127.0.0.1');
            $redisPort = (int) config('database.redis.default.port', 6379);
            $redisPassword = config('database.redis.default.password');

            try {
                $redis = new Redis;
                $connected = @$redis->connect($redisHost, $redisPort, 0.5);

                if ($connected) {
                    if ($redisPassword) {
                        $redis->auth($redisPassword);
                    }
                    $ping = $redis->ping();
                    $this->addResult('Redis', 'Service Ping', 'PASS', "Responding at {$redisHost}:{$redisPort} ({$ping})");
                } else {
                    $isRedisPrimary = config('cache.default') === 'redis' || config('queue.default') === 'redis';
                    $status = $isRedisPrimary ? 'FAIL' : 'WARN';
                    $details = $isRedisPrimary
                        ? "Cannot connect to Redis at {$redisHost}:{$redisPort} (primary driver)"
                        : "Offline at {$redisHost}:{$redisPort} (optional unless CACHE_STORE/QUEUE_CONNECTION is redis)";

                    $this->addResult('Redis', 'Service Ping', $status, $details);
                }
            } catch (Throwable $e) {
                $isRedisPrimary = config('cache.default') === 'redis' || config('queue.default') === 'redis';
                $status = $isRedisPrimary ? 'FAIL' : 'WARN';
                $this->addResult('Redis', 'Service Ping', $status, "Redis test skipped: {$e->getMessage()}");
            }
        }
    }

    private function checkDirectoryPermissions(): void
    {
        $directories = [
            'storage/framework' => storage_path('framework'),
            'storage/framework/cache' => storage_path('framework/cache'),
            'storage/framework/sessions' => storage_path('framework/sessions'),
            'storage/framework/views' => storage_path('framework/views'),
            'storage/logs' => storage_path('logs'),
            'bootstrap/cache' => base_path('bootstrap/cache'),
        ];

        foreach ($directories as $label => $path) {
            if (! File::exists($path)) {
                @File::makeDirectory($path, 0775, true, true);
            }

            if (is_writable($path)) {
                $this->addResult('Filesystem', "{$label}", 'PASS', 'Directory exists and is writable');
            } else {
                $this->addResult('Filesystem', "{$label}", 'FAIL', "Not writable. Run: chmod -R 775 {$label}");
            }
        }
    }

    private function checkFrontendBuildAssets(): void
    {
        $manifestPath = public_path('build/manifest.json');

        if (File::exists($manifestPath)) {
            $bytes = File::size($manifestPath);
            $kb = round($bytes / 1024, 2);
            $this->addResult('Frontend', 'Vite Build Manifest', 'PASS', "public/build/manifest.json present ({$kb} KB)");
        } else {
            $this->addResult('Frontend', 'Vite Build Manifest', 'FAIL', 'Manifest missing. Run: npm run build');
        }
    }

    private function checkSecurityConfiguration(): void
    {
        $appKey = config('app.key');
        if (! empty($appKey)) {
            $this->addResult('Security', 'Application Key', 'PASS', 'APP_KEY configured');
        } else {
            $this->addResult('Security', 'Application Key', 'FAIL', 'APP_KEY missing. Run: php artisan key:generate');
        }

        $appEnv = config('app.env');
        $debug = config('app.debug');

        if ($appEnv === 'production' && $debug) {
            $this->addResult('Security', 'Debug Mode', 'WARN', 'APP_DEBUG=true enabled in production environment');
        } else {
            $this->addResult('Security', 'Debug Mode', 'PASS', "Environment [{$appEnv}], Debug [".($debug ? 'true' : 'false').']');
        }
    }

    private function addResult(string $component, string $check, string $status, string $details): void
    {
        if ($status === 'PASS') {
            $this->passCount++;
        } elseif ($status === 'WARN') {
            $this->warnCount++;
        } else {
            $this->failCount++;
        }

        $this->results[] = [
            'component' => $component,
            'check' => $check,
            'status' => $status,
            'details' => $details,
        ];
    }

    private function renderResultsTable(): void
    {
        $rows = array_map(function (array $item): array {
            $formattedStatus = match ($item['status']) {
                'PASS' => '<fg=green;options=bold>✔ PASS</>',
                'WARN' => '<fg=yellow;options=bold>! WARN</>',
                'FAIL' => '<fg=red;options=bold>✖ FAIL</>',
                default => $item['status'],
            };

            return [
                $item['component'],
                $item['check'],
                $formattedStatus,
                $item['details'],
            ];
        }, $this->results);

        $this->table(
            ['Component', 'Diagnostic Check', 'Status', 'Details'],
            $rows
        );

        $this->newLine();
        $this->line(sprintf(
            '<fg=gray>Diagnostics Summary:</> <fg=green;options=bold>%d passed</>, <fg=yellow;options=bold>%d warnings</>, <fg=red;options=bold>%d failures</>',
            $this->passCount,
            $this->warnCount,
            $this->failCount
        ));
        $this->newLine();

        if ($this->failCount === 0) {
            $this->components->info('All critical environment diagnostics passed! Relay Studio is deployment-ready.');
        } else {
            $this->components->error("Found {$this->failCount} critical diagnostic failure(s). Please review the table above.");
        }
    }
}
