<?php

namespace App;

use RuntimeException;

class Maps {
    protected $db;

    public function __construct(DB $db) {
        $this->db = $db;
    }

    protected function parseRow(array $row)
    {
        $row['body'] = json_decode($row['body'], $assoc = true);  // Once we have PHP 7.3: JSON_THROW_ON_ERROR
        return $row;
    }

    public function find(array $query = [])
    {
        $whereBindings = [];
        foreach ($query as $k => $v) {
            if ($k == 'library') {
                $whereBindings[] = 'library_id = :library';
            } else {
                throw new RuntimeException('Invalid query term');
            }
        }
        
        $sql = 'SELECT * FROM maps';
        if (count($whereBindings)) {
            $sql .= ' WHERE ' . implode(' AND ', $whereBindings);
        }
        return array_map(
            [$this, 'parseRow'],
            $this->db->select($sql, $query)
        );
    }

    public function get(string $id)
    {
        $rows = $this->db->select(
            'SELECT * FROM maps WHERE id = :id',
            ['id' => $id]
        );
        if (!count($rows)) {
            throw new RuntimeException('Map not found');
        }
        return $this->parseRow($rows[0]);
    }

    public function put($map)
    {
        $map['body'] = json_encode($map['body']);

        // We have to work with sqlite <3.24, so we cannot use the native UPSERT
        // Source: https://stackoverflow.com/a/38463024/489916
        $modified = $this->db->update(
            'UPDATE maps
            SET library_id=:library_id,
                name=:name,
                body=:body
            WHERE id=:id',
            $map
        );

        if ($modified === 0) {
            $this->db->update(
                'INSERT INTO maps (id, library_id, name, body)
                VALUES (:id, :library_id, :name, :body)',
                $map
            );
        }

        return $this->get($map['id']);
    }
}