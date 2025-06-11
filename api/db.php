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

function getAtrakcje($pdo)
{
    $stmt = $pdo->query("SELECT * FROM atrakcje");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function insertAtrakcje($pdo, $data, $user)
{
    if (!isAdmin($user)) {
        return null;
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
    $stmt = $pdo->prepare("DELETE FROM atrakcje WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->rowCount();
}

function loginUser($pdo, $data)
{
    $stmt = $pdo->prepare("SELECT id, email, password, role FROM users WHERE email = :email");
    $stmt->execute([':email' => $data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($data['password'], $user['password'])) {
        return $user;
    } else {
        return null;
    }
}

function isAdmin($user)
{
    return $user['role'] === 'admin';
}

function updateUser($pdo, $data)
{
    $stmt = $pdo->prepare("UPDATE users SET email = :email, password = :password, role = :role WHERE id = :id");
    $stmt->execute([
        ':id' => $data['id'],
        ':email' => $data['email'],
        ':password' => password_hash($data['password'], PASSWORD_BCRYPT),
        ':role' => $data['role']
    ]);
    return $stmt->rowCount();
}

function deleteUser($pdo, $id)
{
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->rowCount();
}

function createUser($pdo, $data)
{
    if (!isset($data['imie'], $data['nazwisko'], $data['email'], $data['password'])) {
        return ['error' => 'Missing required fields'];
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = :email");
    $stmt->execute([':email' => $data['email']]);
    if ($stmt->fetchColumn() > 0) {
        return ['error' => 'User already exists'];
    }

    $stmt = $pdo->prepare("INSERT INTO users (email, password, role, imie, nazwisko)
                           VALUES (:email, :password, 'user', :imie, :nazwisko)");

    $stmt->execute([
        ':email' => $data['email'],
        ':password' => password_hash($data['password'], PASSWORD_BCRYPT),
        ':imie' => $data['imie'],
        ':nazwisko' => $data['nazwisko']
    ]);

    return ['message' => 'User created successfully', 'user_id' => $pdo->lastInsertId()];
}
