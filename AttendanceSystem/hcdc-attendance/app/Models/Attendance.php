<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';

    protected $fillable = [
        'attendable_id',
        'attendable_type',
        'time_in',
        'time_out',
        'name',
        'identifier',
        'user_type',
        'laboratory',
    ];

    public $timestamps = true;

    // Polymorphic relationship
    public function attendable()
    {
        return $this->morphTo();
    }

    // ✅ Centralized list of valid laboratories
    public static function validLaboratories(): array
    {
        return [
            'IT Lab 1',
            'IT Lab 2',
            'IT Lab 3 (MacLab)',
            'CyberLab',
            'INT Lab',
            'CCL 1',
            'CCL 2',
            'CCL 3',
        ];
    }

    // ✅ Helper method for checking lab validity
    public static function isValidLaboratory($lab): bool
    {
        return in_array($lab, self::validLaboratories());
    }
}
