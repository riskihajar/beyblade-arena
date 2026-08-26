<?php

arch('app')
    ->expect('App')
    ->not->toUse(['dd', 'dump', 'ray', 'die', 'var_dump']);

arch('controllers')
    ->expect('App\Http\Controllers')
    ->toHaveSuffix('Controller');

arch('models')
    ->expect('App\Models')
    ->toExtend('Illuminate\Database\Eloquent\Model');

arch('commands')
    ->expect('App\Console\Commands')
    ->toExtend('Illuminate\Console\Command');
