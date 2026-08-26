<?php

use App\Ai\ChatAttachment;
use App\Ai\ChatAttachmentService;
use Illuminate\Http\UploadedFile;

test('can create chat attachment from array', function () {
    $data = [
        'id' => 'test-id-123',
        'type' => 'image',
        'name' => 'test.jpg',
        'mime_type' => 'image/jpeg',
        'size' => 1024,
        'storage_driver' => 's3',
        'provider_file_id' => 'provider-123',
        'storage_path' => 'chat-attachments/test.jpg',
        'url' => 'https://example.com/test.jpg',
    ];

    $attachment = ChatAttachment::fromArray($data);

    expect($attachment->id)->toBe('test-id-123');
    expect($attachment->type)->toBe('image');
    expect($attachment->name)->toBe('test.jpg');
    expect($attachment->mimeType)->toBe('image/jpeg');
    expect($attachment->size)->toBe(1024);
    expect($attachment->storageDriver)->toBe('s3');
    expect($attachment->providerFileId)->toBe('provider-123');
    expect($attachment->storagePath)->toBe('chat-attachments/test.jpg');
    expect($attachment->url)->toBe('https://example.com/test.jpg');
});

test('can create chat attachment from uploaded file', function () {
    $file = UploadedFile::fake()->image('test.jpg', 100, 100);

    $attachment = ChatAttachment::fromUploadedFile(
        $file,
        'test-id-456',
        'provider',
        'provider-file-789',
        'storage/path.jpg',
        'https://example.com/path.jpg'
    );

    expect($attachment->id)->toBe('test-id-456');
    expect($attachment->type)->toBe('image');
    expect($attachment->name)->toBe('test.jpg');
    expect($attachment->storageDriver)->toBe('provider');
    expect($attachment->providerFileId)->toBe('provider-file-789');
});

test('determines image type from mime type', function () {
    $file = UploadedFile::fake()->image('photo.png');

    $attachment = ChatAttachment::fromUploadedFile(
        $file,
        'id',
        's3'
    );

    expect($attachment->isImage())->toBeTrue();
    expect($attachment->isDocument())->toBeFalse();
});

test('determines document type from mime type', function () {
    $file = UploadedFile::fake()->create('document.pdf', 1000, 'application/pdf');

    $attachment = ChatAttachment::fromUploadedFile(
        $file,
        'id',
        's3'
    );

    expect($attachment->isDocument())->toBeTrue();
    expect($attachment->isImage())->toBeFalse();
});

test('can convert to array', function () {
    $attachment = new ChatAttachment(
        id: 'test-id',
        type: 'document',
        name: 'test.pdf',
        mimeType: 'application/pdf',
        size: 2048,
        storageDriver: 's3',
        providerFileId: 'provider-id',
        storagePath: 'path/to/file.pdf',
        url: 'https://example.com/file.pdf'
    );

    $array = $attachment->toArray();

    expect($array)->toBe([
        'id' => 'test-id',
        'type' => 'document',
        'name' => 'test.pdf',
        'mime_type' => 'application/pdf',
        'size' => 2048,
        'storage_driver' => 's3',
        'provider_file_id' => 'provider-id',
        'storage_path' => 'path/to/file.pdf',
        'url' => 'https://example.com/file.pdf',
    ]);
});

test('can serialize to json', function () {
    $attachment = new ChatAttachment(
        id: 'test-id',
        type: 'image',
        name: 'test.png',
        mimeType: 'image/png',
        size: 512,
        storageDriver: 'provider'
    );

    $json = json_encode($attachment);
    $decoded = json_decode($json, true);

    expect($decoded['id'])->toBe('test-id');
    expect($decoded['type'])->toBe('image');
    expect($decoded['name'])->toBe('test.png');
});

test('normalizes uppercase file extension for provider compatibility', function () {
    expect(ChatAttachmentService::normalizeFilenameExtension('cat-photo.JPG'))
        ->toBe('cat-photo.jpg');

    expect(ChatAttachmentService::normalizeFilenameExtension('report.PDF'))
        ->toBe('report.pdf');
});
