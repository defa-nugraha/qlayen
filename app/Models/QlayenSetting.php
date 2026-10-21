<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QlayenSetting extends Model
{
    protected $table = 'qlayen_settings';

    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    public static function read(string $key, mixed $default = null): mixed
    {
        try {
            $value = static::query()->whereKey($key)->value('value');
            if ($value === null) {
                return $default;
            }

            return json_decode($value, true, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable) {
            return $default;
        }
    }

    public static function write(string $key, mixed $value): void
    {
        static::query()->updateOrCreate(
            ['key' => $key],
            ['value' => json_encode($value, JSON_THROW_ON_ERROR)],
        );
    }
}
