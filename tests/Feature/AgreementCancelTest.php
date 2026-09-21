<?php

namespace Tests\Feature;

use App\Models\Agreement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgreementCancelTest extends TestCase
{
    use RefreshDatabase;

    private function makeUsers(): array
    {
        $client = User::factory()->create([
            'wallet_address' => '0x1111111111111111111111111111111111111111',
            'role' => 'client',
        ]);
        $freelancer = User::factory()->create([
            'wallet_address' => '0x2222222222222222222222222222222222222222',
            'role' => 'freelancer',
        ]);

        return [$client, $freelancer];
    }

    private function makeAgreement(User $client, User $freelancer, array $overrides = []): Agreement
    {
        return Agreement::create(array_merge([
            'agreement_id' => 'AG-TEST-'.strtoupper(fake()->lexify('??????')),
            'title' => 'Test deal',
            'description' => 'Test description',
            'sow' => ['summary' => 'Test'],
            'status' => 'pending',
            'client_wallet' => $client->wallet_address,
            'freelancer_wallet' => $freelancer->wallet_address,
            'client_id' => $client->id,
            'freelancer_id' => $freelancer->id,
            'sow_hash' => '0x'.str_repeat('a', 64),
        ], $overrides));
    }

    public function test_client_can_request_cancellation(): void
    {
        [$client, $freelancer] = $this->makeUsers();
        $agreement = $this->makeAgreement($client, $freelancer);

        $res = $this->actingAs($client, 'sanctum')->postJson("/api/agreements/{$agreement->id}/cancel-request");

        $res->assertOk();
        $this->assertSame('pending', $agreement->fresh()->status);
        $this->assertSame($client->wallet_address, $agreement->fresh()->cancel_requested_by);
    }

    public function test_other_party_approval_finalises_cancellation(): void
    {
        [$client, $freelancer] = $this->makeUsers();
        $agreement = $this->makeAgreement($client, $freelancer);

        $this->actingAs($client, 'sanctum')->postJson("/api/agreements/{$agreement->id}/cancel-request")->assertOk();
        $res = $this->actingAs($freelancer, 'sanctum')->postJson("/api/agreements/{$agreement->id}/cancel-approve");

        $res->assertOk();
        $this->assertSame('cancelled', $agreement->fresh()->status);
    }

    public function test_requester_cannot_approve_own_request(): void
    {
        [$client, $freelancer] = $this->makeUsers();
        $agreement = $this->makeAgreement($client, $freelancer);

        $this->actingAs($client, 'sanctum')->postJson("/api/agreements/{$agreement->id}/cancel-request")->assertOk();
        $this->actingAs($client, 'sanctum')->postJson("/api/agreements/{$agreement->id}/cancel-approve")->assertForbidden();
        $this->assertSame('pending', $agreement->fresh()->status);
    }

    public function test_non_participant_cannot_request_cancellation(): void
    {
        [$client, $freelancer] = $this->makeUsers();
        $outsider = User::factory()->create(['wallet_address' => '0x3333333333333333333333333333333333333333']);
        $agreement = $this->makeAgreement($client, $freelancer);

        $this->actingAs($outsider, 'sanctum')->postJson("/api/agreements/{$agreement->id}/cancel-request")->assertForbidden();
    }

    public function test_requester_can_withdraw_request(): void
    {
        [$client, $freelancer] = $this->makeUsers();
        $agreement = $this->makeAgreement($client, $freelancer);

        $this->actingAs($freelancer, 'sanctum')->postJson("/api/agreements/{$agreement->id}/cancel-request")->assertOk();
        $res = $this->actingAs($freelancer, 'sanctum')->postJson("/api/agreements/{$agreement->id}/cancel-withdraw");

        $res->assertOk();
        $this->assertNull($agreement->fresh()->cancel_requested_by);
        $this->assertSame('pending', $agreement->fresh()->status);
    }

    public function test_completed_agreement_cannot_be_cancelled(): void
    {
        [$client, $freelancer] = $this->makeUsers();
        $agreement = $this->makeAgreement($client, $freelancer, ['status' => 'completed']);

        $this->actingAs($client, 'sanctum')->postJson("/api/agreements/{$agreement->id}/cancel-request")->assertUnprocessable();
    }
}
