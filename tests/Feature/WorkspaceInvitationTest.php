<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Mail\WorkspaceInvitationMail;
use App\Models\Role;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

final class WorkspaceInvitationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_inviting_team_member_creates_invitation_and_dispatches_signed_email(): void
    {
        Mail::fake();

        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $developerRole = Role::query()->where('name', 'Developer')->firstOrFail();

        $workspace = Workspace::query()->create([
            'name' => 'Starlight Studio',
            'slug' => 'starlight-studio',
            'owner_id' => $owner->id,
        ]);
        $workspace->users()->attach($owner->id, ['role_id' => $owner->role_id]);

        $response = $this->actingAs($owner)
            ->withSession(['active_workspace_id' => $workspace->id])
            ->postJson(route('settings.team.invite'), [
                'email' => 'sarah.engineer@example.com',
                'role_id' => $developerRole->id,
            ]);

        $response->assertStatus(201);

        $invitation = WorkspaceInvitation::query()->where('email', 'sarah.engineer@example.com')->first();
        $this->assertNotNull($invitation);
        $this->assertSame($workspace->id, $invitation->workspace_id);
        $this->assertSame($developerRole->id, $invitation->role_id);
        $this->assertNotEmpty($invitation->token);
        $this->assertTrue($invitation->expires_at->isFuture());

        Mail::assertQueued(WorkspaceInvitationMail::class, function (WorkspaceInvitationMail $mail) use ($invitation): bool {
            return $mail->hasTo('sarah.engineer@example.com')
                && str_contains($mail->invitationUrl(), $invitation->token)
                && str_contains($mail->invitationUrl(), 'signature=');
        });
    }

    public function test_valid_signed_invitation_link_can_render_acceptance_page(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $designerRole = Role::query()->where('name', 'Designer')->firstOrFail();

        $workspace = Workspace::query()->create([
            'name' => 'Design Lab',
            'slug' => 'design-lab',
            'owner_id' => $owner->id,
        ]);

        $invitation = WorkspaceInvitation::query()->create([
            'workspace_id' => $workspace->id,
            'email' => 'art.lead@example.com',
            'role_id' => $designerRole->id,
            'token' => Str::random(40),
            'expires_at' => now()->addDays(7),
            'created_at' => now(),
        ]);

        $mailable = new WorkspaceInvitationMail($invitation);
        $signedUrl = $mailable->invitationUrl();

        $response = $this->get($signedUrl);

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/AcceptInvitation')
            ->where('invitation.email', 'art.lead@example.com')
            ->where('invitation.workspace.name', 'Design Lab')
            ->where('invitation.role.name', 'Designer')
        );
    }

    public function test_unsigned_or_tampered_invitation_link_is_rejected(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $designerRole = Role::query()->where('name', 'Designer')->firstOrFail();

        $workspace = Workspace::query()->create([
            'name' => 'Security Lab',
            'slug' => 'security-lab',
            'owner_id' => $owner->id,
        ]);

        $invitation = WorkspaceInvitation::query()->create([
            'workspace_id' => $workspace->id,
            'email' => 'hacker@example.com',
            'role_id' => $designerRole->id,
            'token' => Str::random(40),
            'expires_at' => now()->addDays(7),
            'created_at' => now(),
        ]);

        // Unsigned direct route
        $unsignedResponse = $this->get(route('invitations.accept', ['token' => $invitation->token]));
        $unsignedResponse->assertForbidden();

        // Tampered signature
        $tamperedUrl = route('invitations.accept', ['token' => $invitation->token]).'?signature=invalidbadhash123';
        $tamperedResponse = $this->get($tamperedUrl);
        $tamperedResponse->assertForbidden();
    }

    public function test_expired_invitation_link_is_rejected(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $designerRole = Role::query()->where('name', 'Designer')->firstOrFail();

        $workspace = Workspace::query()->create([
            'name' => 'Expired Lab',
            'slug' => 'expired-lab',
            'owner_id' => $owner->id,
        ]);

        $invitation = WorkspaceInvitation::query()->create([
            'workspace_id' => $workspace->id,
            'email' => 'late@example.com',
            'role_id' => $designerRole->id,
            'token' => Str::random(40),
            'expires_at' => now()->subDay(),
            'created_at' => now()->subDays(8),
        ]);

        $expiredSignedUrl = URL::temporarySignedRoute(
            'invitations.accept',
            $invitation->expires_at,
            ['token' => $invitation->token]
        );

        $response = $this->get($expiredSignedUrl);
        // Expired signature from temporarySignedRoute is rejected with 403
        $response->assertForbidden();
    }

    public function test_invitee_can_accept_invitation_and_is_enrolled_in_workspace(): void
    {
        $owner = User::query()->where('username', 'robin')->firstOrFail();
        $developerRole = Role::query()->where('name', 'Developer')->firstOrFail();

        $workspace = Workspace::query()->create([
            'name' => 'DevOps Cloud',
            'slug' => 'devops-cloud',
            'owner_id' => $owner->id,
        ]);

        $invitation = WorkspaceInvitation::query()->create([
            'workspace_id' => $workspace->id,
            'email' => 'karen.dev@example.com',
            'role_id' => $developerRole->id,
            'token' => Str::random(40),
            'expires_at' => now()->addDays(7),
            'created_at' => now(),
        ]);

        $response = $this->post(route('invitations.store', $invitation->token), [
            'name' => 'Karen Developer',
            'username' => 'karendev',
            'password' => 'supersecret123',
            'password_confirmation' => 'supersecret123',
        ]);

        $response->assertRedirect(route('dashboard'));

        $newUser = User::query()->where('email', 'karen.dev@example.com')->first();
        $this->assertNotNull($newUser);
        $this->assertSame('Karen Developer', $newUser->name);
        $this->assertSame('karendev', $newUser->username);
        $this->assertTrue(Hash::check('supersecret123', $newUser->password));
        $this->assertTrue($newUser->active);
        $this->assertFalse($newUser->force_password_reset);

        $this->assertDatabaseHas('workspace_user', [
            'workspace_id' => $workspace->id,
            'user_id' => $newUser->id,
            'role_id' => $developerRole->id,
        ]);

        // Invitation is consumed/deleted
        $this->assertDatabaseMissing('workspace_invitations', ['id' => $invitation->id]);

        // Session active workspace is set
        $this->assertSame($workspace->id, session('active_workspace_id'));

        // User is logged in
        $this->assertAuthenticatedAs($newUser);
    }

    public function test_relay_install_command_sets_force_password_reset_true_for_owner(): void
    {
        $adminEmail = 'owner_install_'.uniqid().'@relay.test';

        $this->artisan('relay:install', [
            '--force' => true,
            '--no-seed' => true,
            '--skip-migrate' => true,
            '--app-name' => 'Relay Test Suite',
            '--app-url' => 'http://relay.test',
            '--admin-name' => 'Turnkey Owner',
            '--admin-username' => 'turnkeyowner',
            '--admin-email' => $adminEmail,
            '--admin-password' => 'secret1234',
        ])->assertExitCode(0);

        $user = User::query()->where('email', $adminEmail)->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->force_password_reset);
    }

    public function test_user_with_force_password_reset_is_redirected_to_profile_with_alert(): void
    {
        $ownerRole = Role::query()->where('name', 'Owner')->firstOrFail();
        $user = User::query()->create([
            'name' => 'Temporary Pass Owner',
            'username' => 'temppass',
            'email' => 'temp_pass@relay.test',
            'password' => Hash::make('initialpass123'),
            'role_id' => $ownerRole->id,
            'active' => true,
            'force_password_reset' => true,
        ]);

        $response = $this->post(route('login'), [
            'username' => 'temppass',
            'password' => 'initialpass123',
        ]);

        $response->assertRedirect(route('profile.edit'));
        $response->assertSessionHas('alert', 'Please update your default password to secure your account.');
    }

    public function test_updating_password_clears_force_password_reset_flag(): void
    {
        $ownerRole = Role::query()->where('name', 'Owner')->firstOrFail();
        $user = User::query()->create([
            'name' => 'Reset Me',
            'username' => 'resetme',
            'email' => 'reset_me@relay.test',
            'password' => Hash::make('oldpassword123'),
            'role_id' => $ownerRole->id,
            'active' => true,
            'force_password_reset' => true,
        ]);

        $response = $this->actingAs($user)->put(route('password.update'), [
            'current_password' => 'oldpassword123',
            'password' => 'brandnewpassword123',
            'password_confirmation' => 'brandnewpassword123',
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertFalse($user->force_password_reset);
        $this->assertTrue(Hash::check('brandnewpassword123', $user->password));

        // Subsequent login redirects to dashboard normally
        $this->post(route('logout'));
        $loginResponse = $this->post(route('login'), [
            'username' => 'resetme',
            'password' => 'brandnewpassword123',
        ]);

        $loginResponse->assertRedirect(route('dashboard'));
    }
}
