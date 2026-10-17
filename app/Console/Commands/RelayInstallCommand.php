<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Throwable;

final class RelayInstallCommand extends Command
{
    protected $signature = 'relay:install
        {--force : Force the installation without interactive confirmation}
        {--app-name= : Custom application name}
        {--app-url= : Custom application URL}
        {--admin-name= : Initial Admin/Owner name}
        {--admin-username= : Initial Admin/Owner username}
        {--admin-email= : Initial Admin/Owner email}
        {--admin-password= : Initial Admin/Owner password}
        {--seed : Seed sample workspace data}
        {--no-seed : Do not seed sample workspace data}
        {--skip-migrate : Skip running database migrations}';

    protected $description = 'Interactive turnkey setup wizard for Relay Studio self-hosting';

    public function handle(): int
    {
        $this->displayBanner();

        $this->info('Welcome to the Relay Studio Turnkey Installation Wizard.');
        $this->info('This tool will configure your environment, database, and initial administrator account.');
        $this->newLine();

        // 1. Environment file check & key generation
        $this->setupEnvironment();

        // 2. Application Name and URL configuration
        $this->configureAppDetails();

        // 3. Database connection & migrations
        if (! $this->runDatabaseSetup()) {
            return self::FAILURE;
        }

        // 4. Initial Administrator Account
        $adminCredentials = $this->createAdminAccount();

        // 5. Seed sample workspace
        $this->seedSampleData();

        // 6. Completion Summary
        $this->displaySummary($adminCredentials);

        return self::SUCCESS;
    }

    private function displayBanner(): void
    {
        $banner = <<< 'ASCII'
<fg=cyan;options=bold>
  ██████╗ ███████╗██╗      █████╗ ██╗   ██╗    ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗ 
  ██╔══██╗██╔════╝██║     ██╔══██╗╚██╗ ██╔╝    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
  ██████╔╝█████╗  ██║     ███████║ ╚████╔╝     ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
  ██╔══██╗██╔══╝  ██║     ██╔══██║  ╚██╔╝      ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
  ██║  ██║███████╗███████╗██║  ██║   ██║       ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝       ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ 
</>
<fg=gray>  Linear-Class High Velocity Engineering Studio & Delivery Engine (Open-Source)</>
ASCII;

        $this->line($banner);
        $this->newLine();
    }

    private function setupEnvironment(): void
    {
        $this->components->info('Step 1/5: Checking Environment Configuration (.env)');

        $envPath = base_path('.env');
        $examplePath = base_path('.env.example');

        if (! File::exists($envPath)) {
            if (File::exists($examplePath)) {
                File::copy($examplePath, $envPath);
                $this->components->twoColumnDetail('Environment file', '<fg=green;options=bold>CREATED FROM .env.example</>');
            } else {
                File::put($envPath, "APP_NAME=Relay\nAPP_ENV=local\nAPP_KEY=\nAPP_DEBUG=true\n");
                $this->components->twoColumnDetail('Environment file', '<fg=yellow;options=bold>INITIALIZED</>');
            }
        } else {
            $this->components->twoColumnDetail('Environment file', '<fg=green;options=bold>EXISTS</>');
        }

        // Verify or generate APP_KEY
        $currentKey = config('app.key');
        if (empty($currentKey)) {
            Artisan::call('key:generate', ['--force' => true]);
            $this->components->twoColumnDetail('Application Key', '<fg=green;options=bold>GENERATED</>');
        } else {
            $this->components->twoColumnDetail('Application Key', '<fg=green;options=bold>CONFIGURED</>');
        }
    }

    private function configureAppDetails(): void
    {
        $this->newLine();
        $this->components->info('Step 2/5: Application Branding & Access URL');

        $isInteractive = $this->input->isInteractive() && ! $this->option('force');

        $defaultName = config('app.name', 'Relay Studio');
        $appName = $this->option('app-name')
            ?: ($isInteractive ? $this->ask('Application Name', $defaultName) : $defaultName);

        $defaultUrl = config('app.url', 'http://localhost:8080');
        $appUrl = $this->option('app-url')
            ?: ($isInteractive ? $this->ask('Application URL', $defaultUrl) : $defaultUrl);

        $this->updateEnvFile([
            'APP_NAME' => '"'.$appName.'"',
            'APP_URL' => $appUrl,
            'VITE_APP_NAME' => '"'.$appName.'"',
        ]);

        $this->components->twoColumnDetail('App Name', $appName);
        $this->components->twoColumnDetail('App URL', $appUrl);
    }

    private function runDatabaseSetup(): bool
    {
        $this->newLine();
        $this->components->info('Step 3/5: Database Connectivity & Migrations');

        try {
            DB::connection()->getPdo();
            $connectionName = DB::getDefaultConnection();
            $this->components->twoColumnDetail('Database Connection', "<fg=green;options=bold>CONNECTED ({$connectionName})</>");
        } catch (Throwable $e) {
            $this->components->error('Could not connect to the database: '.$e->getMessage());
            $this->line('<fg=yellow>Please verify your DB_* credentials in .env and ensure the database server is running.</>');

            if (! $this->option('force') && $this->input->isInteractive()) {
                if (! $this->confirm('Would you like to continue anyway?', false)) {
                    return false;
                }
            } else {
                return false;
            }
        }

        if ($this->option('skip-migrate')) {
            $this->components->twoColumnDetail('Database Migrations', '<fg=yellow;options=bold>SKIPPED (--skip-migrate)</>');

            return true;
        }

        $shouldMigrate = $this->option('force')
            || ! $this->input->isInteractive()
            || $this->confirm('Run database migrations now?', true);

        if ($shouldMigrate) {
            $this->line('Running migrations...');
            $exitCode = Artisan::call('migrate', ['--force' => true]);
            if ($exitCode === 0) {
                $this->components->twoColumnDetail('Database Migrations', '<fg=green;options=bold>SUCCESS</>');
            } else {
                $this->components->twoColumnDetail('Database Migrations', '<fg=red;options=bold>FAILED</>');
                $this->error(Artisan::output());

                return false;
            }
        }

        return true;
    }

    /**
     * @return array{name: string, username: string, email: string, password: string}
     */
    private function createAdminAccount(): array
    {
        $this->newLine();
        $this->components->info('Step 4/5: Initial Administrator / Owner Setup');

        $permissions = [
            'manage_team',
            'manage_roles',
            'manage_areas',
            'create_requests',
            'edit_requests',
            'assign_requests',
            'change_request_status',
            'comment_requests',
            'upload_request_files',
            'delete_requests',
        ];

        foreach ($permissions as $permissionName) {
            Permission::query()->firstOrCreate(['name' => $permissionName]);
        }

        /** @var Role $ownerRole */
        $ownerRole = Role::query()->firstOrCreate(['name' => 'Owner']);
        $allPermissions = Permission::query()->whereIn('name', $permissions)->pluck('id');
        $ownerRole->permissions()->sync($allPermissions);

        $name = $this->option('admin-name');
        $username = $this->option('admin-username');
        $email = $this->option('admin-email');
        $password = $this->option('admin-password');

        if ($this->input->isInteractive() && ! $this->option('force')) {
            $createAdmin = $this->confirm('Create or configure an initial Owner account?', true);

            if ($createAdmin) {
                $name = $name ?: $this->ask('Admin Full Name', 'Relay Administrator');
                $username = $username ?: $this->ask('Admin Username', 'admin');
                $email = $email ?: $this->ask('Admin Email Address', 'admin@relay.studio');
                $password = $password ?: $this->secret('Admin Password (default: password)') ?: 'password';
            }
        }

        $name = $name ?: 'Relay Administrator';
        $username = $username ?: 'admin';
        $email = $email ?: 'admin@relay.studio';
        $password = $password ?: 'password';

        /** @var User $user */
        $user = User::query()->firstOrNew(['email' => $email]);
        $user->name = $name;
        $user->username = $username;
        $user->password = Hash::make($password);
        $user->role_id = $ownerRole->id;
        $user->active = true;
        $user->save();

        $this->components->twoColumnDetail('Owner Account', "<fg=green;options=bold>CONFIGURED ({$email})</>");

        return [
            'name' => $name,
            'username' => $username,
            'email' => $email,
            'password' => $password,
        ];
    }

    private function seedSampleData(): void
    {
        $this->newLine();
        $this->components->info('Step 5/5: Workspace Demonstration Data');

        $shouldSeed = false;

        if ($this->option('seed')) {
            $shouldSeed = true;
        } elseif ($this->option('no-seed')) {
            $shouldSeed = false;
        } elseif ($this->input->isInteractive() && ! $this->option('force')) {
            $shouldSeed = $this->confirm('Seed sample projects, team accounts, and demo requests?', true);
        }

        if ($shouldSeed) {
            $this->line('Seeding database with sample workspace data...');
            Artisan::call('db:seed', ['--force' => true]);
            $this->components->twoColumnDetail('Database Seeding', '<fg=green;options=bold>COMPLETED</>');
        } else {
            $this->components->twoColumnDetail('Database Seeding', '<fg=yellow>SKIPPED</>');
        }
    }

    /**
     * @param  array{name: string, username: string, email: string, password: string}  $credentials
     */
    private function displaySummary(array $credentials): void
    {
        $this->newLine(2);
        $this->line('<fg=green;options=bold>====================================================================</>');
        $this->line('<fg=green;options=bold>              RELAY STUDIO TURNKEY SETUP COMPLETE!                  </>');
        $this->line('<fg=green;options=bold>====================================================================</>');
        $this->newLine();

        $this->components->twoColumnDetail('Studio URL', config('app.url', 'http://localhost:8080'));
        $this->components->twoColumnDetail('Administrator Email', $credentials['email']);
        $this->components->twoColumnDetail('Administrator Username', $credentials['username']);
        $this->components->twoColumnDetail('Administrator Password', '******** (as chosen)');
        $this->newLine();

        $this->line('<fg=cyan;options=bold>Quickstart Commands:</>');
        $this->line('  • Launch Development Server : <fg=yellow>php artisan serve</>');
        $this->line('  • Launch Production Docker : <fg=yellow>docker compose up -d</>');
        $this->line('  • Run Queue Worker         : <fg=yellow>php artisan queue:work</>');
        $this->line('  • Run Diagnostics Check    : <fg=yellow>php artisan relay:doctor</>');
        $this->newLine();
        $this->line('<fg=gray>Documentation & Community: https://github.com/relay-studio/relay</>');
        $this->newLine();
    }

    /**
     * @param  array<string, string>  $keyValues
     */
    private function updateEnvFile(array $keyValues): void
    {
        $envPath = base_path('.env');
        if (! File::exists($envPath)) {
            return;
        }

        $content = File::get($envPath);

        foreach ($keyValues as $key => $value) {
            $pattern = "/^{$key}=.*/m";
            if (preg_match($pattern, $content)) {
                $content = preg_replace($pattern, "{$key}={$value}", $content);
            } else {
                $content .= "\n{$key}={$value}";
            }
        }

        File::put($envPath, $content);
    }
}
