<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $key
 * @property string $label
 * @property string $path
 * @property string|null $alt_text
 * @property int|null $updated_by_user_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['key', 'label', 'path', 'alt_text', 'updated_by_user_id'])]
class BrandAsset extends Model
{
    public const PLACEMENTS = [
        'public_header' => 'Logo topbar publik',
        'public_footer' => 'Logo footer publik',
        'app_sidebar' => 'Logo sidebar admin',
        'auth' => 'Logo halaman masuk dan autentikasi',
    ];
}
