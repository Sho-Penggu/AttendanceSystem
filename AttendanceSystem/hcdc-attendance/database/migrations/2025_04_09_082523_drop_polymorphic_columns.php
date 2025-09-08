<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            // Remove non-polymorphic columns if they exist
            if (Schema::hasColumn('attendance', 'user_type')) {
                $table->dropColumn('user_type');
            }
            if (Schema::hasColumn('attendance', 'identifier')) {
                $table->dropColumn('identifier');
            }
            if (Schema::hasColumn('attendance', 'name')) {
                $table->dropColumn('name');
            }

            // Add polymorphic relation columns
            $table->morphs('attendable'); // adds `attendable_id` and `attendable_type`
        });
    }

    public function down(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->dropMorphs('attendable');
            $table->string('user_type')->nullable();
            $table->string('identifier')->nullable();
            $table->string('name')->nullable();
        });
    }
};
