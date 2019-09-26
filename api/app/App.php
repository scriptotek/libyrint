<?php

namespace App;

use RuntimeException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class App {

    protected $storageDirectory;
    protected $db;
    protected $libraries;
    protected $maps;
    protected $jsonEncodeOptions = JSON_PRETTY_PRINT || JSON_UNESCAPED_UNICODE;  // Once we have PHP 7.3: JSON_THROW_ON_ERROR

    public function __construct()
    {
        $this->storageDirectory = dirname(__DIR__) . '/public/images';
        $this->db = DB::open();
        $this->libraries = new Libraries($this->db);
        $this->maps = new Maps($this->db);
    }

    // Router ----------------------------------------------------------------------------

    public function handleRequest(Request $request)
    {
        if ($request->getMethod() == 'OPTIONS') {
            header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
            header('Access-Control-Allow-Origin: *');
            header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, X-Requested-With");
            exit();
        }
        try {
            switch ($request->get('action')) {
                case 'listLibraries':
                    return $this->listLibraries($request);
                case 'getLibrary':
                    return $this->getLibrary($request);
                case 'storeLibrary':
                    return $this->storeLibrary($request);
                case 'listMaps':
                    return $this->listMaps($request);
                case 'getMap':
                    return $this->getMap($request);
                case 'storeMap':
                    return $this->storeMap($request);
                case 'storeMapBackground':
                    return $this->storeMapBackground($request);
                default:
                    return $this->errorResponse('Unknown action');
            }
        } catch (RuntimeException $exception) {
            return $this->errorResponse($exception->getMessage(), 400);
        }
    }

    protected function errorResponse($message, $status = 400)
    {
        return new Response(
            json_encode(['error' => $message], $this->jsonEncodeOptions),
            $status,
            [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
            ]
        );
    }

    protected function jsonResponse($data, $status = 200)
    {
        return new Response(
            json_encode($data, $this->jsonEncodeOptions),
            $status,
            [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
            ]
        );
    }

    // Actions --------------------------------------------------------------------------

    protected function listLibraries(Request $request)
    {
        return $this->jsonResponse([
            'libraries' => $this->libraries->find(),
        ]);
    }

    protected function getLibrary(Request $request)
    {
        return $this->jsonResponse([
            'library' => $this->libraries->get($request->get('id')),
        ]);
    }

    protected function storeLibrary(Request $request)
    {
        $library = json_decode($request->getContent(), $assoc = true);
        return $this->jsonResponse([
            'library' => $this->libraries->put($library),
        ]);
    }

    protected function listMaps(Request $request)
    {
        $query = [];
        if ($request->get('library')) {
            $query['library'] = $request->get('library');
        }
        return $this->jsonResponse([
            'maps' => $this->maps->find($query),
        ]);
    }

    protected function getMap(Request $request)
    {
        return $this->jsonResponse([
            'map' => $this->maps->get($request->get('id')),
        ]);
    }

    protected function storeMap(Request $request)
    {
        $map = json_decode($request->getContent(), $assoc = true);
        return $this->jsonResponse([
            'map' => $this->maps->put($map),
        ]);
    }

    protected function storeMapBackground(Request $request)
    {
        $mapId = $request->get('id');
        $map = $this->maps->get($mapId);

        $file = $request->files->get('image');

        $filename = $mapId.'.'.$file->guessExtension();
        $file->move($this->storageDirectory, $filename);

        $size = getimagesize($this->storageDirectory.'/'.$filename);

        $map['body']['image']['src'] = $filename;
        $map['body']['image']['width'] = $size[0];
        $map['body']['image']['height'] = $size[1];

        return $this->jsonResponse([
            'map' => $this->maps->put($map),
        ]);
    }
}
