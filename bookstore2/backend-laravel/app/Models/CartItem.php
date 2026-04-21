<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $table = 'chi_tiet_gio_hang';
    public $timestamps = false;

    protected $fillable = [
        'gio_hang_id',
        'sach_id',
        'so_luong'
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class, 'gio_hang_id');
    }

    public function sach()
    {
        return $this->belongsTo(Book::class, 'sach_id');
    }
}
