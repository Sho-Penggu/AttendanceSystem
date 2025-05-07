<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $table = 'students';

    protected $fillable = [
        'student_ID',
        'name',
        'gender',
        'department',
        'year'
    ];

    public function attendances()
    {
        return $this->morphMany(Attendance::class, 'attendable');
    }
}
