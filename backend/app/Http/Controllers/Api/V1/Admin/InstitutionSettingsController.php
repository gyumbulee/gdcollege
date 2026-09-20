<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Concerns\UsesUploadsDisk;
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
 * Frontend note: institution.config.ts's colour palette stays static/
 * build-time (it's mirrored into Tailwind's @theme in globals.css, which
 * can't read a database at build time) and the nav menu structure stays
 * static too — only the identity/contact/asset fields below are
 * database-backed. The public site consumes them through publicShow()
 * below via frontend/src/lib/api/institution.ts's getInstitutionData(),
 * which merges this data over institution.config.ts's static fallbacks
 * (never the other way around) — see that file.
 */
class InstitutionSettingsController extends Controller
{
    use ApiResponse, UsesUploadsDisk;

    public function show()
    {
        return $this->success($this->present($this->row()));
    }

    /** Public counterpart to show() — same data (nothing on Institution is sensitive), no auth required. Read by every public page's header/footer/about/contact — see frontend/src/lib/api/institution.ts. */
    public function publicShow()
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
                Storage::disk($this->uploadsDisk())->delete($institution->logo_path);
            }
            $institution->logo_path = $request->file('logo')->store('branding', $this->uploadsDisk());
        }

        if ($request->hasFile('banner')) {
            if ($institution->banner_path) {
                Storage::disk($this->uploadsDisk())->delete($institution->banner_path);
            }
            $institution->banner_path = $request->file('banner')->store('branding', $this->uploadsDisk());
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
            'logo_url' => $institution->logo_path ? Storage::disk($this->uploadsDisk())->url($institution->logo_path) : null,
            'banner_url' => $institution->banner_path ? Storage::disk($this->uploadsDisk())->url($institution->banner_path) : null,
        ];
    }
}
