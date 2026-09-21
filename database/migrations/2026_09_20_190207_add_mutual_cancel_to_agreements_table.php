<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('agreements', function (Blueprint $table) {
            $table->string('cancel_requested_by', 42)->nullable()->after('freelancer_id');
        });

        DB::statement("ALTER TABLE agreements MODIFY COLUMN status ENUM('draft','pending','locked','accepted','rejected','changes_requested','completed','cancelled') NOT NULL DEFAULT 'draft'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agreements', function (Blueprint $table) {
            $table->dropColumn('cancel_requested_by');
        });

        DB::statement("ALTER TABLE agreements MODIFY COLUMN status ENUM('draft','pending','locked','accepted','rejected','changes_requested','completed') NOT NULL DEFAULT 'draft'");
    }
};
