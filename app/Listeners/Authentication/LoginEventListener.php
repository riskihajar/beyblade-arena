<?php

namespace App\Listeners\Authentication;

use App\Concerns\LogsActivity;
use Illuminate\Auth\Events\Login;

class LoginEventListener
{
    use LogsActivity;

    public function handle(Login $event): void
    {
        $user = $event->user;

        $this->logActivity(
            description: 'User logged in',
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
            'login_time' => now()->toIso8601String(),
        ];
    }
}
