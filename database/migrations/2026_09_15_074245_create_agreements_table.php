<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agreements', function (Blueprint $table) {
            $table->id();
            $table->string('agreement_id', 32)->unique(); // e.g. AG-2026-001 or hash prefix
            $table->string('title');
            $table->text('description'); // raw client input
            $table->json('sow'); // structured SoW
            $table->text('deliverables')->nullable();
            $table->date('deadline')->nullable();
            $table->decimal('budget', 10, 2)->nullable();
            $table->string('payment_terms')->nullable();
            $table->string('revision_policy')->nullable();
            $table->enum('status', ['draft', 'pending', 'locked', 'accepted', 'rejected', 'changes_requested', 'completed'])->default('draft');
            $table->string('client_wallet', 42)->index();
            $table->string('freelancer_wallet', 42)->nullable()->index();
            $table->foreignId('client_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('freelancer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('sow_hash', 66)->nullable(); // 0x + 64 hex
            $table->string('tx_hash', 66)->nullable();
            $table->unsignedBigInteger('chain_id')->nullable();
            $table->string('contract_address', 42)->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'client_wallet']);
            $table->index(['status', 'freelancer_wallet']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agreements');
    }
};
