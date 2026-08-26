<?php

namespace App\Exports;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ActivityLogsExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query(): Builder
    {
        $query = Activity::with('causer:id,name,email')->latest();

        $filter = $this->filters['filter'] ?? null;
        if ($filter && $filter !== 'all') {
            match ($filter) {
                'user' => $query->inLog('default'),
                'admin' => $query->inLog('admin'),
                'authentication' => $query->inLog('authentication'),
                default => null,
            };
        }

        if (! empty($this->filters['event'])) {
            $query->forEvent($this->filters['event']);
        }

        if (! empty($this->filters['user_id'])) {
            $userIds = (array) $this->filters['user_id'];
            $query->whereIn('causer_id', $userIds)
                ->where('causer_type', User::class);
        }

        if (! empty($this->filters['date_from'])) {
            $query->where('created_at', '>=', $this->filters['date_from']);
        }

        if (! empty($this->filters['date_to'])) {
            $query->where('created_at', '<=', $this->filters['date_to']);
        }

        if (! empty($this->filters['sort'])) {
            $sort = $this->filters['sort'];
            $direction = $this->filters['direction'] ?? 'desc';
            $allowedSorts = ['description', 'log_name', 'subject_type', 'created_at'];
            if (in_array($sort, $allowedSorts)) {
                $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
            }
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Log Name',
            'Event',
            'Description',
            'Causer Name',
            'Causer Email',
            'Subject Type',
            'Subject ID',
            'Properties',
            'Created At',
        ];
    }

    public function map($activity): array
    {
        return [
            $activity->id,
            $activity->log_name ?? 'default',
            $activity->event ?? 'N/A',
            $activity->description,
            $activity->causer?->name ?? 'System',
            $activity->causer?->email ?? 'N/A',
            $activity->subject_type ?? 'N/A',
            $activity->subject_id ?? 'N/A',
            json_encode($activity->properties, JSON_PRETTY_PRINT),
            $activity->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
