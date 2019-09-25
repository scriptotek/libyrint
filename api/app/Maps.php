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
        $row['body'] = json_decode($row['body'], $assoc = true, JSON_THROW_ON_ERROR);
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
            $this->db->query($sql, $query)
        );
    }

    public function get(string $id)
    {
        $rows = $this->db->query(
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
        $this->db->query(
            'INSERT INTO maps (id, library_id, name, body) 
            VALUES (:id, :library_id, :name, :body)
            ON CONFLICT(id) DO UPDATE SET
                library_id=excluded.library_id,
                name=excluded.name,
                body=excluded.body
            ',
            $map
        );

        return $this->get($map['id']);
    }

    
}