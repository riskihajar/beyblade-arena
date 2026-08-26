<?php

namespace App\Listeners\Authentication;

use App\Concerns\LogsActivity;
use Illuminate\Auth\Events\Logout;

class LogoutEventListener
{
    use LogsActivity;

    public function handle(Logout $event): void
    {
        $user = $event->user;

        if (! $user) {
            return;
        }

        $this->logActivity(
            description: 'User logged out',
            logName: 'authentication',
            subject: $user,
            properties: $this->getProperties($user)
        );
    }

    protected function getProperties($user): array
    {
        return [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'logout_time' => now()->toIso8601String(),
        ];
    }
}
