<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $table = 'sach';
    public $timestamps = false;

    protected $fillable = [
        'ten_sach',
        'tac_gia',
        'gia',
        'so_luong',
        'the_loai_id',
        'hinh_anh',
        'mo_ta'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'the_loai_id', 'id');
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class, 'sach_id');
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class, 'sach_id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, 'sach_id');
    }
}
