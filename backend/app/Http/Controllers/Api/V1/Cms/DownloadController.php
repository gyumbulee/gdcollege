<?php

namespace App\Http\Controllers\Api\V1\Cms;

use App\Http\Controllers\Concerns\UsesUploadsDisk;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\DownloadRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Download;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DownloadController extends Controller
{
    use ApiResponse, UsesUploadsDisk;

    public function publicIndex()
    {
        return $this->success(Download::orderBy('category')->orderByDesc('created_at')->get());
    }

    public function index()
    {
        return $this->success(Download::with('uploadedBy')->orderByDesc('created_at')->get());
    }

    public function store(DownloadRequest $request, AuditLogger $audit)
    {
        $file = $request->file('file');

        $download = Download::create([
            'title' => $request->string('title'),
            'category' => $request->input('category'),
            'file_path' => $file->store('cms/downloads', $this->uploadsDisk()),
            'original_filename' => $file->getClientOriginalName(),
            'uploaded_by' => Auth::id(),
        ]);

        $audit->log('cms.downloads.create', $download, null, $download->only(['title', 'category']));

        return $this->success($download, 'File uploaded.', 201);
    }

    public function destroy(Download $download, AuditLogger $audit)
    {
        Storage::disk($this->uploadsDisk())->delete($download->file_path);
        $audit->log('cms.downloads.delete', $download, $download->only(['title']), null);
        $download->delete();

        return $this->success([], 'File removed.');
    }
}
