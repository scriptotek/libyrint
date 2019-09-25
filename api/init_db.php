<?php

require('./bootstrap.php');

$db = App\DB::open();

$db->query('
CREATE TABLE libraries(
  id TEXT PRIMARY KEY,
  name TEXT
)');

$db->query('
CREATE TABLE maps(
  id TEXT PRIMARY KEY,
  library_id TEXT,
  name TEXT UNIQUE,
  body TEXT,
  FOREIGN KEY(library_id) REFERENCES libraries(id)
)');

$db->query('
  CREATE TABLE shelving_schemes(
  id TEXT PRIMARY KEY,
  name TEXT,
  body TEXT
)');

echo "DB migrated\n";
