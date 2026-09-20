<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default filesystem disk that should be used
    | by the framework. The "local" disk, as well as a variety of cloud
    | based disks are available to your application for file storage.
    |
    */

    'default' => env('FILESYSTEM_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Platform Upload Disks
    |--------------------------------------------------------------------------
    |
    | Every controller across the platform that stores an uploaded file —
    | institution logo/banner, document templates, gallery photos, CMS
    | post/event cover images, CMS downloads (all public-facing), and
    | applicant documents / helpdesk attachments (private — never a
    | public URL, always streamed through an authenticated download
    | endpoint; see ApplicationDocumentController/TicketController) —
    | reads ONE of these two config values instead of hardcoding a disk
    | name. This is the platform's "single source of truth" convention
    | (Master Implementation Brief) applied to storage: switching every
    | one of those controllers from local disk to Amazon S3 is a matter
    | of setting two env vars, never a code change.
    |
    | Locally these default to the "public"/"private" local disks below
    | — zero external dependencies for dev/demo. In production, set
    | UPLOADS_DISK=s3 and PRIVATE_UPLOADS_DISK=s3 (plus the AWS_* vars
    | on the 's3' disk below) and the whole platform's files move to S3
    | automatically. They can also be flipped independently — e.g. keep
    | public assets on local disk behind a CDN, but move only private
    | applicant documents to S3 — since public-facing and
    | authorization-gated files have different exposure requirements.
    |
    */
    'uploads_disk' => env('UPLOADS_DISK', 'public'),
    'private_uploads_disk' => env('PRIVATE_UPLOADS_DISK', 'private'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Below you may configure as many filesystem disks as necessary, and you
    | may even configure multiple disks for the same driver. Examples for
    | most supported storage drivers are configured here for reference.
    |
    | Supported drivers: "local", "ftp", "sftp", "s3"
    |
    */

    'disks' => [

    'local' => [
        'driver' => 'local',
        'root' => storage_path('app/private'),
        'serve' => true,
        'throw' => false,
        'report' => false,
    ],

    'private' => [
        'driver' => 'local',
        'root' => storage_path('app/private'),
        'visibility' => 'private',
        'throw' => false,
        'report' => false,
    ],

    'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => rtrim(env('APP_URL', 'http://localhost'), '/').'/storage',
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

        // Used when UPLOADS_DISK and/or PRIVATE_UPLOADS_DISK above are
        // set to "s3". Required env vars: AWS_ACCESS_KEY_ID,
        // AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION, AWS_BUCKET. AWS_URL
        // is optional (only needed for a custom domain/CloudFront in
        // front of the bucket — Storage::url() falls back to the
        // bucket's own S3 endpoint URL when it's unset). See
        // backend/.env.example.
        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url' => env('AWS_URL'),
            'endpoint' => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'throw' => false,
            'report' => false,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Here you may configure the symbolic links that will be created when the
    | `storage:link` Artisan command is executed. The array keys should be
    | the locations of the links and the values should be their targets.
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
