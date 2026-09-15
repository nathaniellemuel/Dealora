<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Agreement;
use App\Models\Deliverable;
use Illuminate\Http\Request;

class DeliverableController extends Controller
{
    public function store(Request $request, Agreement $agreement)
    {
        $this->authorizeView($request, $agreement);

        $data = $request->validate([
            'milestone_id' => ['nullable', 'exists:milestones,id'],
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'file_url' => ['nullable', 'url', 'max:500'],
        ]);

        $deliverable = $agreement->deliverables()->create([
            'milestone_id' => $data['milestone_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'file_url' => $data['file_url'] ?? null,
            'status' => 'submitted',
            'submitted_by' => strtolower($request->user()->wallet_address),
        ]);

        // also mark milestone submitted if linked
        if (! empty($data['milestone_id'])) {
            $milestone = $agreement->milestones()->find($data['milestone_id']);
            if ($milestone) {
                $milestone->update(['status' => 'submitted', 'escrow_status' => 'submitted']);
            }
        }

        Activity::create([
            'agreement_id' => $agreement->id,
            'actor_wallet' => $request->user()->wallet_address,
            'action' => 'deliverable_submitted',
            'description' => "Deliverable submitted: {$deliverable->title}",
        ]);

        return response()->json($deliverable, 201);
    }

    public function update(Request $request, Deliverable $deliverable)
    {
        $this->authorizeView($request, $deliverable->agreement);

        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
        ]);

        $deliverable->update(['status' => $data['status']]);

        Activity::create([
            'agreement_id' => $deliverable->agreement_id,
            'actor_wallet' => $request->user()->wallet_address,
            'action' => $data['status'] === 'approved' ? 'deliverable_approved' : 'deliverable_rejected',
            'description' => "Deliverable {$data['status']}: {$deliverable->title}",
        ]);

        return response()->json($deliverable->fresh());
    }

    private function authorizeView(Request $request, Agreement $agreement): void
    {
        $wallet = strtolower($request->user()->wallet_address);
        $isParticipant = in_array($wallet, [strtolower($agreement->client_wallet), strtolower((string) $agreement->freelancer_wallet)], true);
        if (! $isParticipant) {
            abort(403, 'You are not a participant of this agreement.');
        }
    }
}
