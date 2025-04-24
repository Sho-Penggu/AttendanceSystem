<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance'; // Define the table name

    protected $fillable = [
        'attendable_id',
        'attendable_type',
        'time_in',
        'time_out',
        'name',          // Optional
        'identifier',    // Optional
        'user_type'      // Optional
    ];

    public $timestamps = true;

    // Define the inverse of the polymorphic relationship
    public function attendable()
    {
        return $this->morphTo();
    }
}
