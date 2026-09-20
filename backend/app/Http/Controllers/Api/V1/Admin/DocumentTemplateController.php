<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Concerns\UsesUploadsDisk;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\DocumentTemplate;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * §22/§30: lets a Super Administrator / ICT Administrator (institution
 * .manage) attach a reference file to each of the platform's document
 * types (admission letter, receipt, transcript, ...). This is DEMO
 * scope, deliberately: DocumentIssuanceService still generates every
 * instant document from live data, never from this file — there is no
 * templating/PDF-rendering engine wired up yet to actually consume it.
 * The upload is real (stored, audited, downloadable) so ICT/Registry can
 * stage the College's preferred layouts now, ahead of that engine.
 */
class DocumentTemplateController extends Controller
{
    use ApiResponse, UsesUploadsDisk;

    public function index()
    {
        return $this->success(
            DocumentTemplate::orderBy('type')->get()->map(fn (DocumentTemplate $t) => $this->present($t))
        );
    }

    public function upload(Request $request, DocumentTemplate $documentTemplate, AuditLogger $audit)
    {
        $validated = $request->validate([
            // Demo scope: any common document/image format is accepted —
            // real rendering-engine constraints (e.g. a specific
            // templating format) aren't defined yet.
            'file' => ['required', 'file', 'max:5120', 'mimes:pdf,doc,docx,png,jpg,jpeg'],
        ]);

        $old = $documentTemplate->only(['file_path', 'original_filename']);

        if ($documentTemplate->file_path) {
            Storage::disk($this->uploadsDisk())->delete($documentTemplate->file_path);
        }

        $file = $validated['file'];
        $documentTemplate->update([
            'file_path' => $file->store('document-templates', $this->uploadsDisk()),
            'original_filename' => $file->getClientOriginalName(),
            'uploaded_by' => $request->user()->id,
            'uploaded_at' => now(),
        ]);

        $audit->log('document_templates.upload', $documentTemplate, $old, $documentTemplate->only(['file_path', 'original_filename']));

        return $this->success($this->present($documentTemplate), 'Template file uploaded.');
    }

    private function present(DocumentTemplate $template): array
    {
        return [
            'id' => $template->id,
            'type' => $template->type,
            'name' => $template->name,
            'description' => $template->description,
            'is_active' => $template->is_active,
            'requires_request' => $template->requires_request,
            'original_filename' => $template->original_filename,
            'file_url' => $template->file_path ? Storage::disk($this->uploadsDisk())->url($template->file_path) : null,
            'uploaded_at' => $template->uploaded_at,
        ];
    }
}
