<?php

namespace App\Http\Controllers\Concerns;

/**
 * Every controller that stores/serves an uploaded file mixes this in
 * instead of hardcoding `private const DISK = 'public'` (or 'private').
 * See config/filesystems.php's `uploads_disk` / `private_uploads_disk` —
 * the single place that decides whether these are local disks or
 * Amazon S3. Nothing below ever needs to change to move a controller's
 * files to S3; only the env vars do.
 */
trait UsesUploadsDisk
{
    /** Public-facing files: logos/banners, document templates, gallery photos, CMS images/downloads. */
    protected function uploadsDisk(): string
    {
        return config('filesystems.uploads_disk');
    }

    /** Private files, never a public URL: applicant documents, helpdesk attachments — served only via an authenticated download endpoint. */
    protected function privateUploadsDisk(): string
    {
        return config('filesystems.private_uploads_disk');
    }
}
