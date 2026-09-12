<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            DevSuperAdminSeeder::class,
            AcademicStructureSeeder::class,
            ResultConfigSeeder::class,
            // Institution row seeder is added once official details are
            // confirmed (currently left null — see Phase 0/1 config).
        ]);
    }
}
