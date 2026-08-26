<?php

namespace App\Exports;

use App\Models\Role;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class RolesExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query(): Builder
    {
        $query = Role::with('permissions')->latest();

        if (isset($this->filters['search']) && ! empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            '#',
            'Name',
            'Guard Name',
            'Permissions Count',
            'Users Count',
            'Created At',
            'Updated At',
        ];
    }

    public function map($role): array
    {
        return [
            $role->id,
            $role->name,
            $role->guard_name,
            $role->permissions->count(),
            $role->users_count ?? 0,
            $role->created_at->format('Y-m-d H:i:s'),
            $role->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
