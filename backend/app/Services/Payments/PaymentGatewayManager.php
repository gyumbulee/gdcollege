<?php

namespace App\Services\Payments;

use RuntimeException;

class PaymentGatewayManager
{
    public function driver(?string $name = null): PaymentGatewayContract
    {
        $name = $name ?? config('payments.default');
        $config = config("payments.gateways.{$name}");

        if (! $config) {
            throw new RuntimeException("Unknown payment gateway [{$name}].");
        }

        return app($config['driver']);
    }
}
