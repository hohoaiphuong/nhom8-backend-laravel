<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'nguoi_dung';
    public $timestamps = false;
    const CREATED_AT = 'ngay_tao';

    protected $fillable = [
        'ten',
        'email',
        'mat_khau',
        'so_dien_thoai',
        'vai_tro',
        'api_token'
    ];

    protected $hidden = [
        'mat_khau'
    ];

    // Relationships
    public function orders()
    {
        return $this->hasMany(Order::class, 'nguoi_dung_id');
    }

    public function addresses()
    {
        return $this->hasMany(Address::class, 'nguoi_dung_id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, 'nguoi_dung_id');
    }

    public function cart()
    {
        return $this->hasOne(Cart::class, 'nguoi_dung_id');
    }
}
