<?php

namespace App\Http\Controllers\Api\V1\Admissions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admissions\UploadDocumentRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Application;
use App\Models\ApplicationDocument;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApplicationDocumentController extends Controller
{
    use ApiResponse;

    /** Private disk only — see config/filesystems.php's `private` disk. */
    private const DISK = 'private';

    public function store(UploadDocumentRequest $request, Application $application)
    {
        $this->authorize('manageDocuments', $application);

        $file = $request->file('file');
        $path = $file->store("applications/{$application->id}", self::DISK);

        $document = $application->documents()->create([
            'document_type' => $request->string('document_type'),
            'original_filename' => $file->getClientOriginalName(),
            'storage_path' => $path,
            'size_bytes' => $file->getSize(),
        ]);

        return $this->success($document, 'Document uploaded.', 201);
    }

    public function destroy(Application $application, ApplicationDocument $document)
    {
        $this->authorize('manageDocuments', $application);
        abort_if($document->application_id !== $application->id, 404);

        Storage::disk(self::DISK)->delete($document->storage_path);
        $document->delete();

        return $this->success([], 'Document removed.');
    }

    /** Streams the file only to the owning applicant — never a public URL. */
    public function download(Application $application, ApplicationDocument $document): StreamedResponse
    {
        $this->authorize('view', $application);
        abort_if($document->application_id !== $application->id, 404);

        return Storage::disk(self::DISK)->download($document->storage_path, $document->original_filename);
    }
}
