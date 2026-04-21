<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $table = 'gio_hang';
    public $timestamps = false;

    protected $fillable = [
        'nguoi_dung_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class, 'gio_hang_id');
    }
}
