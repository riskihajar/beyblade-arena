<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class UsersExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query(): Builder
    {
        $query = User::with('roles')->latest();

        if (isset($this->filters['search']) && ! empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function (Builder $q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (isset($this->filters['status']) && ! empty($this->filters['status'])) {
            if ($this->filters['status'] === 'verified') {
                $query->whereNotNull('email_verified_at');
            } elseif ($this->filters['status'] === 'unverified') {
                $query->whereNull('email_verified_at');
            }
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            '#',
            'Name',
            'Email',
            'Roles',
            'Email Verified',
            'Created At',
            'Updated At',
        ];
    }

    public function map($user): array
    {
        return [
            $user->id,
            $user->name,
            $user->email,
            $user->roles->pluck('name')->join(', '),
            $user->email_verified_at ? 'Yes' : 'No',
            $user->created_at->format('Y-m-d H:i:s'),
            $user->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
