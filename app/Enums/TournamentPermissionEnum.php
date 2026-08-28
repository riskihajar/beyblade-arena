<?php

namespace App\Enums;

enum TournamentPermissionEnum: string
{
    // User & Role
    case USER_VIEW = 'user.view';
    case USER_CREATE = 'user.create';
    case USER_UPDATE = 'user.update';
    case USER_DELETE = 'user.delete';
    case ROLE_VIEW = 'role.view';
    case ROLE_CREATE = 'role.create';
    case ROLE_UPDATE = 'role.update';
    case ROLE_DELETE = 'role.delete';
    case ADMIN_ACCESS = 'admin.access';

    // Tournament Management
    case TOURNAMENT_VIEW = 'tournament.view';
    case TOURNAMENT_CREATE = 'tournament.create';
    case TOURNAMENT_UPDATE = 'tournament.update';
    case TOURNAMENT_DELETE = 'tournament.delete';
    case TOURNAMENT_MANAGE_BRACKETS = 'tournament.manage_brackets';
    case TOURNAMENT_JUDGE = 'tournament.judge';
    case TOURNAMENT_CHECKIN = 'tournament.checkin';

    // Season & Stadium
    case SEASON_MANAGE = 'season.manage';
    case STADIUM_MANAGE = 'stadium.manage';
    case RULESET_MANAGE = 'ruleset.manage';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
