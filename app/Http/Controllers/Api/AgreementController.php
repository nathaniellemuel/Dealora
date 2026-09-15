<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Agreement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AgreementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $wallet = strtolower($user->wallet_address);

        $query = Agreement::with(['activities' => fn ($q) => $q->latest()->limit(5)])->latest();

        if ($user->role === 'client') {
            $query->where('client_wallet', $wallet);
        } elseif ($user->role === 'freelancer') {
            $query->where('freelancer_wallet', $wallet);
        } else {
            $query->where(function ($q) use ($wallet) {
                $q->where('client_wallet', $wallet)->orWhere('freelancer_wallet', $wallet);
            });
        }

        return response()->json($query->get());
    }

    public function show(Request $request, Agreement $agreement)
    {
        $this->authorizeView($request, $agreement);

        $agreement->load(['activities' => fn ($q) => $q->latest(), 'milestones', 'deliverables']);

        return response()->json($agreement);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:5000'],
            'deliverables' => ['nullable', 'string', 'max:2000'],
            'deadline' => ['nullable', 'date', 'after:today'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'payment_terms' => ['nullable', 'string', 'max:500'],
            'revision_policy' => ['nullable', 'string', 'max:500'],
            'freelancer_wallet' => ['nullable', 'regex:/^0x[a-fA-F0-9]{40}$/'],
        ]);

        $user = $request->user();

        if ($user->role !== 'client') {
            return response()->json(['message' => 'Only clients can create agreements.'], 403);
        }

        $sow = $this->generateSowArray($data);

        $agreement = Agreement::create([
            'agreement_id' => 'AG-'.now()->format('Ymd').'-'.strtoupper(Str::random(6)),
            'title' => $data['title'],
            'description' => $data['description'],
            'sow' => $sow,
            'deliverables' => $data['deliverables'] ?? $sow['deliverables'][0] ?? null,
            'deadline' => $data['deadline'] ?? null,
            'budget' => $data['budget'] ?? null,
            'payment_terms' => $data['payment_terms'] ?? null,
            'revision_policy' => $data['revision_policy'] ?? null,
            'status' => 'draft',
            'client_wallet' => strtolower($user->wallet_address),
            'freelancer_wallet' => isset($data['freelancer_wallet']) ? strtolower($data['freelancer_wallet']) : null,
            'client_id' => $user->id,
            'sow_hash' => $this->hashSow($sow),
        ]);

        if (! empty($data['freelancer_wallet'])) {
            $freelancer = User::where('wallet_address', strtolower($data['freelancer_wallet']))->first();
            if ($freelancer) {
                $agreement->update(['freelancer_id' => $freelancer->id]);
            }
        }

        Activity::create([
            'agreement_id' => $agreement->id,
            'actor_wallet' => $user->wallet_address,
            'action' => 'created',
            'description' => 'Agreement created',
        ]);

        Activity::create([
            'agreement_id' => $agreement->id,
            'actor_wallet' => $user->wallet_address,
            'action' => 'sow_generated',
            'description' => 'Scope of work generated',
            'metadata' => $sow,
        ]);

        return response()->json($agreement, 201);
    }

    public function generateSow(Request $request)
    {
        $data = $request->validate([
            'description' => ['required', 'string', 'max:5000'],
        ]);

        $sow = $this->generateSowArray(['description' => $data['description']]);

        return response()->json([
            'sow' => $sow,
            'hash' => $this->hashSow($sow),
        ]);
    }

    public function update(Request $request, Agreement $agreement)
    {
        $this->authorizeView($request, $agreement);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:120'],
            'deliverables' => ['nullable', 'string', 'max:2000'],
            'deadline' => ['nullable', 'date'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'payment_terms' => ['nullable', 'string', 'max:500'],
            'revision_policy' => ['nullable', 'string', 'max:500'],
            'freelancer_wallet' => ['nullable', 'regex:/^0x[a-fA-F0-9]{40}$/'],
            'status' => ['sometimes', 'in:draft,pending,accepted,rejected,changes_requested,locked,completed'],
        ]);

        $allowed = ['title', 'deliverables', 'deadline', 'budget', 'payment_terms', 'revision_policy'];
        $updates = array_intersect_key($data, array_flip($allowed));

        if (isset($data['freelancer_wallet'])) {
            $updates['freelancer_wallet'] = strtolower($data['freelancer_wallet']);
            $freelancer = User::where('wallet_address', strtolower($data['freelancer_wallet']))->first();
            if ($freelancer) {
                $updates['freelancer_id'] = $freelancer->id;
            }
        }

        if (isset($data['status'])) {
            $updates['status'] = $data['status'];
        }

        // regenerate sow hash if sow-related fields change
        if (! empty($updates)) {
            $agreement->update($updates);

            // simple sow update
            $sow = $agreement->sow;
            if (isset($updates['deliverables'])) {
                $sow['deliverables'] = [$updates['deliverables']];
            }
            if (isset($updates['budget'])) {
                $sow['payment'] = '$'.$updates['budget'];
            }
            if (isset($updates['deadline'])) {
                $sow['timeline'] = $updates['deadline'];
            }
            $agreement->update(['sow' => $sow, 'sow_hash' => $this->hashSow($sow)]);
        }

        Activity::create([
            'agreement_id' => $agreement->id,
            'actor_wallet' => $request->user()->wallet_address,
            'action' => $data['status'] ?? 'updated',
            'description' => 'Agreement updated',
            'metadata' => $data,
        ]);

        return response()->json($agreement->fresh());
    }

    public function lock(Request $request, Agreement $agreement)
    {
        $this->authorizeView($request, $agreement);

        $data = $request->validate([
            'tx_hash' => ['required', 'regex:/^0x[a-fA-F0-9]{64}$/'],
            'chain_id' => ['required', 'integer'],
            'contract_address' => ['nullable', 'regex:/^0x[a-fA-F0-9]{40}$/'],
        ]);

        if ($agreement->status === 'locked') {
            return response()->json(['message' => 'Already locked.'], 422);
        }

        $agreement->update([
            'tx_hash' => $data['tx_hash'],
            'chain_id' => $data['chain_id'],
            'contract_address' => $data['contract_address'] ?? $agreement->contract_address,
            'status' => 'locked',
            'locked_at' => now(),
        ]);

        Activity::create([
            'agreement_id' => $agreement->id,
            'actor_wallet' => $request->user()->wallet_address,
            'action' => 'locked',
            'description' => 'Agreement locked on BOT Chain',
            'metadata' => $data,
        ]);

        return response()->json($agreement->fresh());
    }

    public function destroy(Request $request, Agreement $agreement)
    {
        $this->authorizeView($request, $agreement);

        if (in_array($agreement->status, ['locked', 'accepted', 'completed'], true)) {
            return response()->json(['message' => 'This agreement can no longer be deleted.'], 422);
        }

        $wallet = strtolower($request->user()->wallet_address);
        if (strtolower($agreement->client_wallet) !== $wallet) {
            return response()->json(['message' => 'Only the client can delete this agreement.'], 403);
        }

        $agreement->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    public function verify(string $identifier)
    {
        $agreement = Agreement::where('agreement_id', $identifier)
            ->orWhere('sow_hash', $identifier)
            ->orWhere('tx_hash', $identifier)
            ->first();

        if (! $agreement) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json([
            'agreement_id' => $agreement->agreement_id,
            'title' => $agreement->title,
            'sow_hash' => $agreement->sow_hash,
            'client_wallet' => $agreement->client_wallet,
            'freelancer_wallet' => $agreement->freelancer_wallet,
            'status' => $agreement->status,
            'locked_at' => $agreement->locked_at,
            'tx_hash' => $agreement->tx_hash,
            'chain_id' => $agreement->chain_id,
            'contract_address' => $agreement->contract_address,
        ]);
    }

    private function authorizeView(Request $request, Agreement $agreement): void
    {
        $wallet = strtolower($request->user()->wallet_address);
        $isParticipant = in_array($wallet, [strtolower($agreement->client_wallet), strtolower((string) $agreement->freelancer_wallet)], true);

        if (! $isParticipant) {
            abort(403, 'You are not a participant of this agreement.');
        }
    }

    private function generateSowArray(array $data): array
    {
        $description = $data['description'] ?? '';

        // lightweight heuristic — real AI can replace this later
        $deliverables = $data['deliverables'] ?? $this->inferDeliverables($description);
        $timeline = $this->inferTimeline($description, $data['deadline'] ?? null);
        $payment = $data['payment_terms'] ?? $this->inferPayment($description, $data['budget'] ?? null);
        $revisions = $data['revision_policy'] ?? 'Two revision rounds within scope. Additional scope requires a new agreement.';

        return [
            'summary' => $description,
            'deliverables' => [$deliverables],
            'timeline' => $timeline,
            'payment' => $payment,
            'revision_policy' => $revisions,
        ];
    }

    private function inferDeliverables(string $description): string
    {
        if (str_contains(strtolower($description), 'landing page')) {
            return 'Landing page build as described, deployed preview, and source code in a shared repo.';
        }

        return 'Work as described in the project brief.';
    }

    private function inferTimeline(string $description, ?string $deadline): string
    {
        if ($deadline) {
            return 'Delivery by '.$deadline.'.';
        }

        if (preg_match('/(\d+)\s*weeks?/i', $description, $m)) {
            return 'Delivery in '.$m[1].' weeks.';
        }

        if (preg_match('/(\d+)\s*days?/i', $description, $m)) {
            return 'Delivery in '.$m[1].' days.';
        }

        return 'Timeline to be confirmed after review.';
    }

    private function inferPayment(string $description, $budget): string
    {
        if ($budget !== null) {
            return '$'.$budget.' on accepted delivery.';
        }

        if (preg_match('/\$\s*(\d[\d,\.]*)/', $description, $m)) {
            return '$'.$m[1].' on accepted delivery.';
        }

        return 'Payment terms to be confirmed.';
    }

    private function hashSow(array $sow): string
    {
        $json = json_encode($sow, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return '0x'.hash('sha256', $json);
    }
}
