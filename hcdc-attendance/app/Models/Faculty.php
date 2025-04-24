<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;

    protected $table = 'faculty';

    protected $fillable = [
        'faculty_ID',
        'name',
        'department',
        'position'
    ];

    public function attendances()
    {
        return $this->morphMany(Attendance::class, 'attendable');
    }
}
