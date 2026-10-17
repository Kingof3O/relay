<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

final class RelayCliCommandsTest extends TestCase
{
    use RefreshDatabase;

    public function test_relay_doctor_command_runs_successfully(): void
    {
        $this->artisan('relay:doctor')
            ->expectsOutputToContain('RELAY STUDIO SYSTEM & DEPLOYMENT DOCTOR')
            ->expectsOutputToContain('PHP Version')
            ->expectsOutputToContain('Vite Build Manifest')
            ->assertExitCode(0);
    }

    public function test_relay_install_command_runs_with_options_and_creates_owner(): void
    {
        $adminEmail = 'testowner_'.uniqid().'@relay.test';

        $this->artisan('relay:install', [
            '--force' => true,
            '--no-seed' => true,
            '--skip-migrate' => true,
            '--app-name' => 'Relay Test Suite',
            '--app-url' => 'http://relay.test',
            '--admin-name' => 'Test Owner',
            '--admin-username' => 'testowner',
            '--admin-email' => $adminEmail,
            '--admin-password' => 'secret1234',
        ])
            ->expectsOutputToContain('RELAY STUDIO TURNKEY SETUP COMPLETE!')
            ->expectsOutputToContain($adminEmail)
            ->assertExitCode(0);

        $user = User::where('email', $adminEmail)->first();

        $this->assertNotNull($user);
        $this->assertSame('Test Owner', $user->name);
        $this->assertSame('testowner', $user->username);
        $this->assertTrue(Hash::check('secret1234', $user->password));
        $this->assertTrue($user->active);
        $this->assertSame('Owner', $user->role->name);
    }
}
