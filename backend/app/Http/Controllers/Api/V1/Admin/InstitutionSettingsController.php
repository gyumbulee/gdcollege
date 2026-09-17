<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\InstitutionSettingsRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Institution;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\Storage;

/**
 * §Branding/UI-UX: "Claude must explicitly tell me where to place the
 * College logo/banner, institution name, short name, primary brand
 * colour... do not scatter these values throughout the codebase." Phase 0
 * answered that with a single-source-of-truth pattern (the `institutions`
 * table + frontend/src/config/institution.config.ts), and every migration
 * and config comment since has pointed here — "once Phase 21 exists,
 * these can move to database-backed institution settings." This is that:
 * the first endpoint that can actually read or write the Institution row.
 *
 * Frontend note (not built in this phase): institution.config.ts's colour
 * palette stays static/build-time (it's mirrored into Tailwind's @theme in
 * globals.css, which can't read a database at build time) — only the
 * identity/contact/asset fields below become dynamically editable here.
 */
class InstitutionSettingsController extends Controller
{
    use ApiResponse;

    private const DISK = 'public';

    public function show()
    {
        return $this->success($this->present($this->row()));
    }

    public function update(InstitutionSettingsRequest $request, AuditLogger $audit)
    {
        $institution = $this->row();
        $old = $institution->only(['formal_name', 'short_name', 'motto', 'address', 'city', 'state', 'country', 'phone', 'email']);

        $institution->fill($request->safe()->except(['logo', 'banner']));

        if ($request->hasFile('logo')) {
            if ($institution->logo_path) {
                Storage::disk(self::DISK)->delete($institution->logo_path);
            }
            $institution->logo_path = $request->file('logo')->store('branding', self::DISK);
        }

        if ($request->hasFile('banner')) {
            if ($institution->banner_path) {
                Storage::disk(self::DISK)->delete($institution->banner_path);
            }
            $institution->banner_path = $request->file('banner')->store('branding', self::DISK);
        }

        $institution->save();

        $audit->log('institution.update', $institution, $old, $institution->only(['formal_name', 'short_name', 'motto', 'address', 'city', 'state', 'country', 'phone', 'email']));

        return $this->success($this->present($institution), 'Institution settings updated.');
    }

    /** Fetch-or-create the single row — see the model's own docblock on why this isn't DB-constrained to one row. */
    private function row(): Institution
    {
        return Institution::first() ?? Institution::create([
            'formal_name' => 'Goran Dutse College of General Studies Wase',
            'short_name' => 'GD College Wase',
            'country' => 'Nigeria',
        ]);
    }

    private function present(Institution $institution): array
    {
        return [
            'id' => $institution->id,
            'formal_name' => $institution->formal_name,
            'short_name' => $institution->short_name,
            'motto' => $institution->motto,
            'address' => $institution->address,
            'city' => $institution->city,
            'state' => $institution->state,
            'country' => $institution->country,
            'phone' => $institution->phone,
            'email' => $institution->email,
            'logo_url' => $institution->logo_path ? Storage::disk(self::DISK)->url($institution->logo_path) : null,
            'banner_url' => $institution->banner_path ? Storage::disk(self::DISK)->url($institution->banner_path) : null,
        ];
    }
}
