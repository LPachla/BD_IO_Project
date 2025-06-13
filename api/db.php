<?php

function connectDB()
{
    include_once "db_connect.php";

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

function getPowiatIDFromName($pdo, $data)
{
    $stmt = $pdo->prepare("SELECT id FROM powiaty WHERE powiat = :powiat");
    $stmt->execute([
        ':powiat' => $data['powiat'],
    ]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getZdjecia($pdo)
{
    $stmt = $pdo->query("SELECT * FROM zdjecia");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function deleteZdjecia($pdo, $id) {
    if(!isLoggedIn()){
        return ['error' => 'Not logged in'];
    }
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        return ['error' => 'Only admin can insert atrakcje'];
    }
    $stmt = $pdo->prepare("DELETE FROM zdjecia WHERE atrakcja = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->rowCount();
}

function getAtrakcje($pdo)
{
    $stmt = $pdo->query("SELECT * FROM atrakcje");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function insertAtrakcje($pdo, $data)
{
    if(!isLoggedIn()){
        return ['error' => 'Not logged in'];
    }
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        return ['error' => 'Only admin can insert atrakcje'];
    }

    $stmt = $pdo->prepare("INSERT INTO atrakcje (nazwa, powiat, typ, opis, lokalizacjaX, lokalizacjaY, ocena)
                           VALUES (:nazwa, :powiat, :typ, :opis, :lokalizacjaX, :lokalizacjaY, :ocena)");
    $stmt->execute([
        ':nazwa' => $data['nazwa'],
        ':powiat' => $data['powiat'],
        ':typ' => $data['typ'],
        ':opis' => $data['opis'],
        ':lokalizacjaX' => $data['lokalizacjaX'],
        ':lokalizacjaY' => $data['lokalizacjaY'],
        ':ocena' => $data['ocena'],
    ]);
    return $pdo->lastInsertId();
}


function updateAtrakcje($pdo, $data)
{
    if(!isLoggedIn()){
        return ['error' => 'Not logged in'];
    }
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        return ['error' => 'Only admin can insert atrakcje'];
    }
    $stmt = $pdo->prepare("UPDATE atrakcje SET
        nazwa = :nazwa, powiat = :powiat, typ = :typ, opis = :opis,
        lokalizacjaX = :lokalizacjaX, lokalizacjaY = :lokalizacjaY, ocena = :ocena
        WHERE id = :id");
    $stmt->execute([
        ':id' => $data['id'],
        ':nazwa' => $data['nazwa'],
        ':powiat' => $data['powiat'],
        ':typ' => $data['typ'],
        ':opis' => $data['opis'],
        ':lokalizacjaX' => $data['lokalizacjaX'],
        ':lokalizacjaY' => $data['lokalizacjaY'],
        ':ocena' => $data['ocena'],
    ]);
    return $stmt->rowCount();
}

function deleteAtrakcje($pdo, $id)
{
    if(!isLoggedIn()){
        return ['error' => 'Not logged in'];
    }
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        return ['error' => 'Only admin can insert atrakcje'];
    }
    $stmt = $pdo->prepare("DELETE FROM atrakcje WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->rowCount();
}

function updateUser($pdo, $data)
{
    if (!isLoggedIn()) {
        return ['error' => 'You need to be logged in to update data'];
    }
    if (!in_array($data['role'], ['user', 'admin'])) {
        return ['error' => 'Invalid role specified'];
    }

    $stmt = $pdo->prepare("UPDATE users SET id = :id, email = :email, password = :password, role = :role, imie = :imie, nazwisko = :nazwisko WHERE id = :id");
    $stmt->execute([
        ':id' => $data['id'],
        ':email' => $data['email'],
        ':password' => password_hash($data['password'], PASSWORD_BCRYPT),
        ':role' => $data['role'],
        ':imie' => $data['imie'],
        ':nazwisko' => $data['nazwisko']
    ]);
    return $stmt->rowCount();
}

function deleteUser($pdo, $email)
{
    if (!isLoggedIn()) {
        return ['error' => 'You have to bo logged in to delete account'];
    }
    $stmt = $pdo->prepare("DELETE FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    return $stmt->rowCount();
}

function createUser($pdo, $data)
{
    if (!isset($data['imie'], $data['nazwisko'], $data['email'], $data['password'])) {
        return ['error' => 'Missing required fields'];
    }
    if (!in_array($data['role'], ['user', 'admin'])) {
        return ['error' => 'Invalid role specified'];
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = :email");
    $stmt->execute([':email' => $data['email']]);
    if ($stmt->fetchColumn() > 0) {
        return ['error' => 'User already exists'];
    }

    $stmt = $pdo->prepare("INSERT INTO users (email, password, role, imie, nazwisko)
                           VALUES (:email, :password, :role, :imie, :nazwisko)");

    $stmt->execute([
        ':email' => $data['email'],
        ':password' => password_hash($data['password'], PASSWORD_BCRYPT),
        ':role' => $data['role'],
        ':imie' => $data['imie'],
        ':nazwisko' => $data['nazwisko']
    ]);

    return ['message' => 'User created successfully', 'user_id' => $pdo->lastInsertId()];
}
