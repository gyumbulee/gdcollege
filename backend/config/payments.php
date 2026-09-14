<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Payment Gateway
    |--------------------------------------------------------------------------
    |
    | §21: "Use a payment abstraction... Don't tightly couple the entire
    | application to one provider." Every gateway driver implements
    | PaymentGatewayContract; PaymentGatewayManager resolves whichever one
    | is configured here. 'test' is a real, fully-functional deterministic
    | gateway (not a mock) — safe for development/demo and for an
    | institution that wants to record manual/offline payments without a
    | live processor; swap to 'paystack'/'flutterwave'/'korapay' once
    | real merchant credentials exist.
    |
    */
    'default' => env('PAYMENT_GATEWAY', 'test'),

    'gateways' => [
        'test' => [
            'driver' => \App\Services\Payments\TestGateway::class,
        ],
        'paystack' => [
            'driver' => \App\Services\Payments\PaystackGateway::class,
            'secret_key' => env('PAYSTACK_SECRET_KEY'),
            'base_url' => env('PAYSTACK_BASE_URL', 'https://api.paystack.co'),
        ],
        'flutterwave' => [
            'driver' => \App\Services\Payments\FlutterwaveGateway::class,
            'secret_key' => env('FLUTTERWAVE_SECRET_KEY'),
            'base_url' => env('FLUTTERWAVE_BASE_URL', 'https://api.flutterwave.com/v3'),
            'webhook_hash' => env('FLUTTERWAVE_WEBHOOK_HASH'),
        ],
        'korapay' => [
            'driver' => \App\Services\Payments\KorapayGateway::class,
            'secret_key' => env('KORAPAY_SECRET_KEY'),
            'base_url' => env('KORAPAY_BASE_URL', 'https://api.korapay.com/merchant/api/v1'),
            'webhook_url' => env('KORAPAY_WEBHOOK_URL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Shared Secret
    |--------------------------------------------------------------------------
    |
    | Not every provider signs webhooks the same way (Paystack: HMAC
    | SHA512 of the raw body; Flutterwave: a static verif-hash header).
    | Each gateway driver validates its own provider's signature scheme
    | inside verifyWebhookSignature(); this generic secret is only used by
    | the 'test' gateway.
    |
    */
    'webhook_secret' => env('PAYMENT_WEBHOOK_SECRET', 'dev-only-test-webhook-secret'),

    /*
    |--------------------------------------------------------------------------
    | Invoice Numbering
    |--------------------------------------------------------------------------
    |
    | Same {token} placeholder convention as config/students.php's matric
    | number format — not hardcoded, concurrency-safe (InvoiceNumberCounter,
    | same locked-counter pattern as matric/application numbers).
    |
    */
    'invoice_number_format' => env('INVOICE_NUMBER_FORMAT', 'INV/{session}/{seq}'),
    'invoice_number_sequence_padding' => (int) env('INVOICE_NUMBER_SEQUENCE_PADDING', 6),

];
