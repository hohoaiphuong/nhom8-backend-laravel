<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    protected $table = 'chi_tiet_don_hang';
    public $timestamps = false;

    protected $fillable = [
        'don_hang_id',
        'sach_id',
        'so_luong',
        'gia'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'don_hang_id');
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'sach_id');
    }
}
