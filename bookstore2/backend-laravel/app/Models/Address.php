<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $table = 'dia_chi';
    public $timestamps = false;

    protected $fillable = [
        'nguoi_dung_id',
        'dia_chi',
        'mac_dinh'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'dia_chi_id');
    }
}
