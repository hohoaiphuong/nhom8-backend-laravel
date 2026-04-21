<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'thanh_toan';
    public $timestamps = false;

    protected $fillable = [
        'don_hang_id',
        'phuong_thuc',
        'trang_thai'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'don_hang_id');
    }
}
