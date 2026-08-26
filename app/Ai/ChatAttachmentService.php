<?php

namespace App\Ai;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Ai\Files;
use Laravel\Ai\Files\Document;
use Laravel\Ai\Files\Image;
use Symfony\Component\HttpFoundation\File\UploadedFile as SymfonyUploadedFile;

class ChatAttachmentService
{
    public function __construct(
        protected string $defaultDisk = 'rustfs',
        protected string $attachmentPath = 'chat-attachments',
    ) {}

    /**
     * @param  array{provider: string, model_id: string, supports_provider_storage: bool}  $resolvedModel
     */
    public function store(
        UploadedFile $file,
        array $resolvedModel,
        ?string $userId = null,
    ): ChatAttachment {
        $normalizedFile = $this->normalizeUpload($file);
        $id = Str::ulid()->toString();
        $mimeType = $normalizedFile->getMimeType() ?? 'application/octet-stream';
        $type = ChatAttachment::determineType($mimeType);
        $originalName = $file->getClientOriginalName();

        $s3Path = $this->storeToS3($normalizedFile, $id, $userId);
        $s3Url = $this->getS3Url($s3Path);

        if ($resolvedModel['supports_provider_storage'] ?? false) {
            $providerFileId = $this->storeToProvider($normalizedFile, $type, $resolvedModel['provider']);

            return new ChatAttachment(
                id: $id,
                type: $type,
                name: $originalName,
                mimeType: $mimeType,
                size: $file->getSize(),
                storageDriver: 'provider',
                providerFileId: $providerFileId,
                storagePath: $s3Path,
                url: $s3Url,
            );
        }

        return new ChatAttachment(
            id: $id,
            type: $type,
            name: $originalName,
            mimeType: $mimeType,
            size: $file->getSize(),
            storageDriver: 's3',
            providerFileId: null,
            storagePath: $s3Path,
            url: $s3Url,
        );
    }

    public function getProviderFile(ChatAttachment $attachment, string $provider): Document|Image|null
    {
        if (! $attachment->providerFileId) {
            return $this->getFromS3($attachment, $provider);
        }

        return match ($attachment->type) {
            'image' => Image::fromId($attachment->providerFileId),
            'document' => Document::fromId($attachment->providerFileId),
            default => Document::fromId($attachment->providerFileId),
        };
    }

    protected function storeToS3(UploadedFile $file, string $id, ?string $userId): string
    {
        $extension = Str::lower($file->getClientOriginalExtension());
        $filename = $userId
            ? "{$userId}/{$id}.{$extension}"
            : "{$id}.{$extension}";

        $path = $file->storeAs(
            $this->attachmentPath,
            $filename,
            $this->defaultDisk,
        );

        return $path;
    }

    public static function normalizeFilenameExtension(string $filename): string
    {
        $extension = pathinfo($filename, PATHINFO_EXTENSION);

        if ($extension === '') {
            return $filename;
        }

        $name = pathinfo($filename, PATHINFO_FILENAME);

        return $name.'.'.Str::lower($extension);
    }

    protected function normalizeUpload(UploadedFile $file): UploadedFile
    {
        $originalName = $file->getClientOriginalName();
        $normalizedName = self::normalizeFilenameExtension($originalName);

        if ($normalizedName === $originalName) {
            return $file;
        }

        return UploadedFile::createFromBase(new SymfonyUploadedFile(
            path: $file->getPathname(),
            originalName: $normalizedName,
            mimeType: $file->getClientMimeType(),
            error: $file->getError(),
            test: true,
        ));
    }

    protected function getS3Url(string $path): string
    {
        return Storage::disk($this->defaultDisk)->url($path);
    }

    protected function storeToProvider(UploadedFile $file, string $type, string $provider): string
    {
        $storableFile = match ($type) {
            'image' => Image::fromUpload($file),
            default => Document::fromUpload($file),
        };

        $response = Files::put($storableFile, provider: $provider);

        return $response->id();
    }

    protected function getFromS3(ChatAttachment $attachment, string $provider): Document|Image|null
    {
        if (! $attachment->storagePath) {
            return null;
        }

        return match ($attachment->type) {
            'image' => Image::fromStorage($attachment->storagePath, $this->defaultDisk),
            default => Document::fromStorage($attachment->storagePath, $this->defaultDisk),
        };
    }

    public function delete(ChatAttachment $attachment): void
    {
        if ($attachment->providerFileId) {
            try {
                Files::delete($attachment->providerFileId);
            } catch (\Throwable) {
            }
        }

        if ($attachment->storagePath) {
            try {
                Storage::disk($this->defaultDisk)->delete($attachment->storagePath);
            } catch (\Throwable) {
            }
        }
    }
}
