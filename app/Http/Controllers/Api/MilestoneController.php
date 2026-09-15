<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Agreement;
use App\Models\Milestone;
use Illuminate\Http\Request;

class MilestoneController extends Controller
{
    public function index(Request $request, Agreement $agreement)
    {
        $this->authorizeView($request, $agreement);
        return response()->json($agreement->milestones()->latest()->get());
    }

    public function store(Request $request, Agreement $agreement)
    {
        $this->authorizeView($request, $agreement);
        if (strtolower($agreement->client_wallet) !== strtolower($request->user()->wallet_address)) {
            return response()->json(['message' => 'Only client can add milestones.'], 403);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'amount' => ['required', 'numeric', 'min:0'],
            'due_date' => ['nullable', 'date'],
        ]);

        $milestone = $agreement->milestones()->create($data);

        Activity::create([
            'agreement_id' => $agreement->id,
            'actor_wallet' => $request->user()->wallet_address,
            'action' => 'milestone_added',
            'description' => "Milestone added: {$milestone->title}",
            'metadata' => $data,
        ]);

        return response()->json($milestone, 201);
    }

    public function update(Request $request, Milestone $milestone)
    {
        $this->authorizeView($request, $milestone->agreement);

        $data = $request->validate([
            'status' => ['sometimes', 'in:pending,in_progress,submitted,approved,rejected'],
            'escrow_status' => ['sometimes', 'in:unfunded,funded,submitted,approved,paid'],
        ]);

        $milestone->update($data);

        Activity::create([
            'agreement_id' => $milestone->agreement_id,
            'actor_wallet' => $request->user()->wallet_address,
            'action' => $data['status'] ?? $data['escrow_status'] ?? 'updated',
            'description' => 'Milestone updated',
            'metadata' => $data,
        ]);

        return response()->json($milestone->fresh());
    }

    public function fund(Request $request, Agreement $agreement)
    {
        $this->authorizeView($request, $agreement);
        $data = $request->validate([
            'tx_hash' => ['required', 'regex:/^0x[a-fA-F0-9]{64}$/'],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        $agreement->update([
            'funded_amount' => $agreement->funded_amount + $data['amount'],
            'escrow_status' => 'funded',
            'escrow_tx_hash' => $data['tx_hash'],
        ]);

        Activity::create([
            'agreement_id' => $agreement->id,
            'actor_wallet' => $request->user()->wallet_address,
            'action' => 'funded',
            'description' => "Escrow funded: {$data['amount']} BOT",
            'metadata' => $data,
        ]);

        return response()->json($agreement->fresh());
    }

    public function submit(Request $request, Milestone $milestone)
    {
        $agreement = $milestone->agreement;
        $this->authorizeView($request, $agreement);

        if (strtolower($agreement->freelancer_wallet) !== strtolower($request->user()->wallet_address)) {
            return response()->json(['message' => 'Only freelancer can submit.'], 403);
        }

        $milestone->update(['status' => 'submitted', 'escrow_status' => 'submitted']);

        Activity::create([
            'agreement_id' => $agreement->id,
            'actor_wallet' => $request->user()->wallet_address,
            'action' => 'milestone_submitted',
            'description' => "Milestone submitted: {$milestone->title}",
        ]);

        return response()->json($milestone->fresh());
    }

    public function approve(Request $request, Milestone $milestone)
    {
        $agreement = $milestone->agreement;
        $this->authorizeView($request, $agreement);

        if (strtolower($agreement->client_wallet) !== strtolower($request->user()->wallet_address)) {
            return response()->json(['message' => 'Only client can approve.'], 403);
        }

        $milestone->update(['status' => 'approved', 'escrow_status' => 'paid', 'completed_at' => now()]);
        $agreement->increment('funded_amount', 0); // keep for stats, actual release tracked via milestone

        Activity::create([
            'agreement_id' => $agreement->id,
            'actor_wallet' => $request->user()->wallet_address,
            'action' => 'milestone_approved',
            'description' => "Milestone approved and released: {$milestone->title} ({$milestone->amount})",
            'metadata' => ['amount' => $milestone->amount],
        ]);

        // if all milestones approved, mark agreement completed
        if ($agreement->milestones()->where('status', '!=', 'approved')->where('id', '!=', $milestone->id)->count() === 0) {
            // check if all approved now
            $remaining = $agreement->milestones()->where('status', '!=', 'approved')->count();
            if ($remaining === 0) {
                $agreement->update(['status' => 'completed']);
            }
        }

        return response()->json($milestone->fresh());
    }

    public function requestChanges(Request $request, Milestone $milestone)
    {
        $agreement = $milestone->agreement;
        $this->authorizeView($request, $agreement);

        if (strtolower($agreement->client_wallet) !== strtolower($request->user()->wallet_address)) {
            return response()->json(['message' => 'Only client can request changes.'], 403);
        }

        $milestone->update(['status' => 'in_progress', 'escrow_status' => 'funded']);

        Activity::create([
            'agreement_id' => $agreement->id,
            'actor_wallet' => $request->user()->wallet_address,
            'action' => 'milestone_changes_requested',
            'description' => "Changes requested: {$milestone->title}",
        ]);

        return response()->json($milestone->fresh());
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
