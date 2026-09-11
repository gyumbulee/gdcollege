<?php

/**
 * NOT a drop-in file — add App\Providers\AuthServiceProvider::class to the
 * array in your real bootstrap/providers.php (Laravel 11 registers
 * providers there instead of config/app.php):
 */

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\AuthServiceProvider::class, // <-- add this line
];
