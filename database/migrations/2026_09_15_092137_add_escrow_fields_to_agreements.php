<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agreements', function (Blueprint $table) {
            $table->decimal('funded_amount', 10, 2)->default(0)->after('budget');
            $table->string('escrow_status', 20)->default('unfunded')->after('funded_amount'); // unfunded, funded, partially_released, released
            $table->string('escrow_tx_hash', 66)->nullable()->after('escrow_status');
        });

        Schema::table('milestones', function (Blueprint $table) {
            $table->string('escrow_status', 20)->default('unfunded')->after('status'); // unfunded, funded, submitted, approved, paid
        });
    }

    public function down(): void
    {
        Schema::table('agreements', function (Blueprint $table) {
            $table->dropColumn(['funded_amount', 'escrow_status', 'escrow_tx_hash']);
        });
        Schema::table('milestones', function (Blueprint $table) {
            $table->dropColumn(['escrow_status']);
        });
    }
};
