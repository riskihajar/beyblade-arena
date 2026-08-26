<?php

namespace App\Ai;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\UploadedFile;
use JsonSerializable;

readonly class ChatAttachment implements Arrayable, JsonSerializable
{
    public function __construct(
        public string $id,
        public string $type,
        public string $name,
        public string $mimeType,
        public int $size,
        public string $storageDriver,
        public ?string $providerFileId = null,
        public ?string $storagePath = null,
        public ?string $url = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            type: $data['type'],
            name: $data['name'],
            mimeType: $data['mime_type'],
            size: $data['size'] ?? 0,
            storageDriver: $data['storage_driver'],
            providerFileId: $data['provider_file_id'] ?? null,
            storagePath: $data['storage_path'] ?? null,
            url: $data['url'] ?? null,
        );
    }

    public static function fromUploadedFile(
        UploadedFile $file,
        string $id,
        string $storageDriver,
        ?string $providerFileId = null,
        ?string $storagePath = null,
        ?string $url = null,
    ): self {
        $mimeType = $file->getMimeType() ?? 'application/octet-stream';

        return new self(
            id: $id,
            type: self::determineType($mimeType),
            name: $file->getClientOriginalName(),
            mimeType: $mimeType,
            size: $file->getSize(),
            storageDriver: $storageDriver,
            providerFileId: $providerFileId,
            storagePath: $storagePath,
            url: $url,
        );
    }

    public static function determineType(string $mimeType): string
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        }

        return 'document';
    }

    public function isImage(): bool
    {
        return $this->type === 'image';
    }

    public function isDocument(): bool
    {
        return $this->type === 'document';
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'name' => $this->name,
            'mime_type' => $this->mimeType,
            'size' => $this->size,
            'storage_driver' => $this->storageDriver,
            'provider_file_id' => $this->providerFileId,
            'storage_path' => $this->storagePath,
            'url' => $this->url,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
