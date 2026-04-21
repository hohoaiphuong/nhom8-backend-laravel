<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'the_loai';
    public $timestamps = false;

    protected $fillable = [
        'ten'
    ];

    public function books()
    {
        return $this->hasMany(Book::class, 'the_loai_id', 'id');
    }
}
