<?php

function mix($path) {
    $manifests = [];
    $publicPath = __DIR__ . '/public';


    if (substr($path, 0, 1) !== '/') {
        $path = "/{$path}";
    }

    // if (file_exists(public_path('/hot'))) {
    //     $url = rtrim(file_get_contents(public_path('/hot')));

    //     if (Str::startsWith($url, ['http://', 'https://'])) {
    //         return new HtmlString(Str::after($url, ':').$path);
    //     }

    //     return new HtmlString("//localhost:8080{$path}");
    // }

    $manifestPath = $publicPath . '/mix-manifest.json';

    if (! isset($manifests[$manifestPath])) {
        if (! file_exists($manifestPath)) {
            throw new Exception('The Mix manifest does not exist.');
        }

        $manifests[$manifestPath] = json_decode(file_get_contents($manifestPath), true);
    }

    $manifest = $manifests[$manifestPath];

    if (! isset($manifest[$path])) {
        throw new Exception("Unable to locate Mix file: {$path}.");
    }

    return '/client' . $manifest[$path];
}
