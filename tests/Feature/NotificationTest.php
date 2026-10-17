<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\RequestDatabaseNotification;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_user_can_view_notifications_index(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();

        $user->notify(new RequestDatabaseNotification([
            'event' => 'assignment',
            'request_id' => 101,
            'request_title' => 'Redesign triage page',
            'message' => 'Alice assigned this request to you.',
            'url' => '/requests/101',
        ]));

        $response = $this->actingAs($user)->get(route('notifications.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Notifications/Index')
            ->has('notifications', 1)
        );
    }

    public function test_user_can_mark_notification_as_read_and_unread(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();

        $user->notify(new RequestDatabaseNotification([
            'event' => 'status_changed',
            'request_id' => 102,
            'request_title' => 'Kanban feature',
            'message' => 'Status changed to In Review.',
            'url' => '/requests/102',
        ]));

        $notification = $user->unreadNotifications()->firstOrFail();

        // Mark as read
        $readResponse = $this->actingAs($user)->post(route('notifications.read', $notification->id));
        $readResponse->assertOk()->assertJson(['read' => true]);
        $this->assertEquals(0, $user->fresh()->unreadNotifications()->count());

        // Mark as unread
        $unreadResponse = $this->actingAs($user)->post(route('notifications.unread', $notification->id));
        $unreadResponse->assertOk()->assertJson(['read' => false]);
        $this->assertEquals(1, $user->fresh()->unreadNotifications()->count());

        // Toggle back to read
        $toggleResponse = $this->actingAs($user)->post(route('notifications.toggle', $notification->id));
        $toggleResponse->assertOk()->assertJson(['read' => true]);
        $this->assertEquals(0, $user->fresh()->unreadNotifications()->count());
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();

        $user->notify(new RequestDatabaseNotification([
            'event' => 'comment',
            'request_id' => 103,
            'request_title' => 'Comment on API',
            'message' => 'Bob commented on this request.',
            'url' => '/requests/103',
        ]));

        $user->notify(new RequestDatabaseNotification([
            'event' => 'blocked',
            'request_id' => 104,
            'request_title' => 'Blocked bug',
            'message' => 'Charlie blocked this request.',
            'url' => '/requests/104',
        ]));

        $this->assertEquals(2, $user->unreadNotifications()->count());

        $response = $this->actingAs($user)->post(route('notifications.read-all'));
        $response->assertOk()->assertJson(['read' => true]);

        $this->assertEquals(0, $user->fresh()->unreadNotifications()->count());
    }
}
