<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('wallet_address', 42)->nullable()->unique()->after('email');
            $table->enum('role', ['client', 'freelancer'])->nullable()->after('wallet_address');
            $table->string('nonce', 64)->nullable()->after('role');

            // make default Laravel fields optional for wallet auth
            $table->string('name')->nullable()->change();
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['wallet_address', 'role', 'nonce']);
        });
    }
};
