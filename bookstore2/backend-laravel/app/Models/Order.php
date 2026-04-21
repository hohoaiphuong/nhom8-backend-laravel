<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'don_hang';
    public $timestamps = false;
    const CREATED_AT = 'ngay_tao';

    protected $fillable = [
        'nguoi_dung_id',
        'dia_chi_id',
        'email',
        'so_dien_thoai',
        'dia_chi',
        'ten_khach',
        'phuong_thuc_van_chuyen',
        'tong_tien',
        'trang_thai'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }

    public function address()
    {
        return $this->belongsTo(Address::class, 'dia_chi_id');
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class, 'don_hang_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'don_hang_id');
    }
}
