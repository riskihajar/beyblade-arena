<?php

namespace App\Concerns;

trait LogsActivity
{
    protected function logActivity(string $description, string $logName = 'default', ?object $subject = null, array $properties = []): void
    {
        activity()
            ->inLog($logName)
            ->performedOn($subject)
            ->causedBy(auth()->user())
            ->withProperties($properties)
            ->log($description);
    }
}
