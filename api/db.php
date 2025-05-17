<?php

function connectDB()
{
    $host = 'bd';
    $db = 'postgres';
    $user = 'postgres';
    $pass = 'password';

    try {
        $pdo = new PDO("pgsql:host=$host;dbname=$db", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        die(json_encode(['error' => 'Connection failed: ' . $e->getMessage()]));
    }
}

function getPowiaty($pdo)
{
    $stmt = $pdo->query("SELECT * FROM powiaty");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getZdjecia($pdo)
{
    $stmt = $pdo->query("SELECT * FROM zdjecia");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getAtrakcje($pdo)
{
    $stmt = $pdo->query("SELECT * FROM atrakcje");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function insertAtrakcje($pdo, $data)
{
    $stmt = $pdo->prepare("INSERT INTO atrakcje (nazwa, powiat, opis, lokalizacjaX, lokalizacjaY, ocena)
                           VALUES (:nazwa, :powiat, :opis, :lokalizacjaX, :lokalizacjaY, :ocena)");
    $stmt->execute([
        ':nazwa' => $data['nazwa'],
        ':powiat' => $data['powiat'],
        ':opis' => $data['opis'],
        ':lokalizacjaX' => $data['lokalizacjaX'],
        ':lokalizacjaY' => $data['lokalizacjaY'],
        ':ocena' => $data['ocena'],
    ]);
    return $pdo->lastInsertId();
}

function updateAtrakcje($pdo, $data)
{
    $stmt = $pdo->prepare("UPDATE atrakcje SET
        nazwa = :nazwa, powiat = :powiat, opis = :opis,
        lokalizacjaX = :lokalizacjaX, lokalizacjaY = :lokalizacjaY, ocena = :ocena
        WHERE id = :id");
    $stmt->execute([
        ':id' => $data['id'],
        ':nazwa' => $data['nazwa'],
        ':powiat' => $data['powiat'],
        ':opis' => $data['opis'],
        ':lokalizacjaX' => $data['lokalizacjaX'],
        ':lokalizacjaY' => $data['lokalizacjaY'],
        ':ocena' => $data['ocena'],
    ]);
    return $stmt->rowCount();
}

function deleteAtrakcje($pdo, $id)
{
    $stmt = $pdo->prepare("DELETE FROM atrakcje WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->rowCount();
}
