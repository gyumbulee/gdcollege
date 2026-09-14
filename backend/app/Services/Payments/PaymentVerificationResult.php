<?php

namespace App\Services\Payments;

/**
 * Uniform result shape across every gateway driver, so
 * PaymentVerificationService never needs to know which provider it's
 * talking to.
 */
final class PaymentVerificationResult
{
    public function __construct(
        public readonly bool $successful,
        public readonly ?string $gatewayReference,
        public readonly ?float $amount,
        public readonly array $raw,
    ) {
    }
}
