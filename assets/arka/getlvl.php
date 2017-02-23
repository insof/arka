<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json; charset=utf-8');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if (filter_input(INPUT_GET, "level")) {
    $lv = "arkalevels/" . filter_input(INPUT_GET, "level");
    echo file_get_contents($lv);
}