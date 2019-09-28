<?php

if (!isset($_GET['loc'])) {
    echo <<<EOF

<p>
Denne sida nyttjer same søkesyntaks som Axiell si kartløysing.
For oppslag utanfor Realfagsbiblioteket, omdirigerarar vi til dem.
</p>

Eksemplar:

<ul>
<li>
<a href="./?instance_id=no_ubo&loc=k00457&shelf=XII:172&bib=Crystallography&lib=UREAL&lang=no">Kjemisamlingen</a>
</li>
</ul>


EOF;
 exit;
}

if ($_GET['lib'] !== 'UREAL') {
    // Redirect to Axiell for everything non-UREAL
    $url = 'https://hotel2.axiell.com/app/map/wicket/PageLocations?' . $_SERVER['QUERY_STRING'];
    header('Location: ' . $url);
    exit;
}

if (!isset($_GET['shelf'])) {
    die('Dette dokumentet har ukjent hylleplassering. Kontakt skranken for mer informasjon.');
}

if (!isset($_GET['loc'])) {
    die('Dette dokumentet har ukjent hylleplassering. Kontakt skranken for mer informasjon.');
}
