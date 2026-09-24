<?php

/*
 * Default institution identity — used only to seed the `institutions`
 * table's single row the first time it's accessed (see
 * Admin\InstitutionSettingsController::row()). After that first access,
 * every field is edited through /admin/institution and lives in the
 * database, not here.
 *
 * Kept as env-driven config specifically so a rename is a one-line env
 * change, not a hunt through controller code — found this wasn't
 * actually wired up while doing the Wase Rock College rename: these
 * INSTITUTION_FORMAL_NAME/INSTITUTION_SHORT_NAME env vars were
 * documented in .env.example but nothing ever read them, and
 * InstitutionSettingsController::row() had the name hardcoded directly
 * instead. Fixed both at once.
 */
return [
    'formal_name' => env('INSTITUTION_FORMAL_NAME', 'Wase Rock College of General Studies Wase'),
    'short_name' => env('INSTITUTION_SHORT_NAME', 'Wase Rock College'),
];
