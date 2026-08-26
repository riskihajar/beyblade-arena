<?php

use Illuminate\Support\Facades\Storage;

describe('RustFS Storage', function () {
    beforeEach(function () {
        Storage::fake('rustfs');
    });

    it('can upload a text file', function () {
        Storage::disk('rustfs')->put('test/hello.txt', 'Hello, RustFS!');

        Storage::disk('rustfs')->assertExists('test/hello.txt');
    });

    it('can read uploaded file content', function () {
        $content = 'Test content for reading';
        Storage::disk('rustfs')->put('test/read.txt', $content);

        $readContent = Storage::disk('rustfs')->get('test/read.txt');

        expect($readContent)->toBe($content);
    });

    it('can check if file exists', function () {
        Storage::disk('rustfs')->put('test/exists.txt', 'test');

        Storage::disk('rustfs')->assertExists('test/exists.txt');
        Storage::disk('rustfs')->assertMissing('test/nonexistent.txt');
    });

    it('can list files in directory', function () {
        Storage::disk('rustfs')->put('test/file1.txt', 'content1');
        Storage::disk('rustfs')->put('test/file2.txt', 'content2');

        $files = Storage::disk('rustfs')->files('test');

        expect($files)->toContain('test/file1.txt');
        expect($files)->toContain('test/file2.txt');
    });

    it('can delete a file', function () {
        Storage::disk('rustfs')->put('test/delete.txt', 'delete me');
        Storage::disk('rustfs')->assertExists('test/delete.txt');

        Storage::disk('rustfs')->delete('test/delete.txt');

        Storage::disk('rustfs')->assertMissing('test/delete.txt');
    });

    it('can get file size', function () {
        $content = 'Size test content';
        Storage::disk('rustfs')->put('test/size.txt', $content);

        $size = Storage::disk('rustfs')->size('test/size.txt');

        expect($size)->toBe(strlen($content));
    });

    it('can copy file to another location', function () {
        Storage::disk('rustfs')->put('test/original.txt', 'original content');

        Storage::disk('rustfs')->copy('test/original.txt', 'test/copy.txt');

        Storage::disk('rustfs')->assertExists('test/copy.txt');
        expect(Storage::disk('rustfs')->get('test/copy.txt'))->toBe('original content');
    });

    it('can move/rename file', function () {
        Storage::disk('rustfs')->put('test/old-name.txt', 'rename me');

        Storage::disk('rustfs')->move('test/old-name.txt', 'test/new-name.txt');

        Storage::disk('rustfs')->assertExists('test/new-name.txt');
        Storage::disk('rustfs')->assertMissing('test/old-name.txt');
    });
});
