<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $table = 'danh_gia';
    public $timestamps = false;
    const CREATED_AT = 'ngay_tao';

    protected $fillable = [
        'nguoi_dung_id',
        'sach_id',
        'so_sao',
        'binh_luan'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'sach_id');
    }
}
