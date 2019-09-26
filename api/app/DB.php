<?php

namespace App;

use RuntimeException;
use PDO;

class DB {

    protected $conn;

    static public function open()
    {
        if (!isset($_ENV['DB_NAME'])) {
            throw new RuntimeException('No DB_NAME specified');
        }
        $dsn = 'sqlite:' . dirname(__DIR__) . '/' . $_ENV['DB_NAME'];
        $conn = new PDO(
            $dsn,
            null,
            null,
            [
                // PDO::ATTR_PERSISTENT => true,
            ]
        );
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return new static($conn);
    }

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
    }

    public function query(string $query, array $args = [])
    {
        $stmt = $this->conn->prepare($query);
        foreach ($args as $key => &$val) {
            $stmt->bindParam(':'.$key, $val, PDO::PARAM_STR);
        }
        $stmt->execute();
        return $stmt;
    }

    public function select(string $query, array $args = [])
    {
        return $this->query($query, $args)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update(string $query, array $args = [])
    {
        return $this->query($query, $args)->rowCount();
    }
}