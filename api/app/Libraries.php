<?php

namespace App;

use RuntimeException;
use Symfony\Component\Mime\Exception\InvalidArgumentException;

class Libraries {
    protected $db;

    public function __construct(DB $db) {
        $this->db = $db;
    }

    protected function parseRow(array $row)
    {
        $row['name'] = json_decode($row['name'], $assoc = true, JSON_THROW_ON_ERROR);
        return $row;
    }

    public function find()
    {        
        return array_map(
            [$this, 'parseRow'],
            $this->db->query('SELECT * FROM libraries')
        );
    }

    public function get(string $id)
    {
        $rows = $this->db->query(
            'SELECT * FROM libraries WHERE id = :id',
            ['id' => $id]
        );
        if (!count($rows)) {
            throw new RuntimeException('Library not found');
        }
        return $this->parseRow($rows[0]);
    }

    public function put($data)
    {
        if (!$data['id']) {
            throw new InvalidArgumentException('No id given');
        }
        if (!$data['name']) {
            throw new InvalidArgumentException('No name given');
        }

        $data['name'] = json_encode($data['name']);
        $this->db->query(
            'INSERT INTO libraries (id, name) 
            VALUES (:id, :name)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name
            ',
            $data
        );

        return $this->get($data['id']);
    }

    
}