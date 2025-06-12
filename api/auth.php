<?php

if (session_id() == '') {
    session_start();
}
require_once 'db.php';

$pdo = connectDB();
$method = $_SERVER['REQUEST_METHOD'];

function loginUser($pdo, $email, $password)
{
    $stmt = $pdo->prepare("SELECT id, email, password, role, imie, nazwisko FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        return $user;
    }
    return null;
}

function isAdmin($user)
{
    return isset($user['role']) && $user['role'] === 'admin';
}

function isLoggedIn()
{
    return isset($_SESSION['id']);
}

function logoutUser()
{
    session_unset();
    session_destroy();
    setcookie(session_name(), '', time() - 3600, '/');
    session_start();
}

function getUserData()
{
    return [
        'id' => $_SESSION['id'] ?? null,
        'role' => $_SESSION['role'] ?? null,
        'email' => $_SESSION['email'] ?? null,
        'password' => $_SESSION['password'] ?? null,
        'imie' => $_SESSION['imie'] ?? null,
        'nazwisko' => $_SESSION['nazwisko'] ?? null
    ];
}

function getCurrentUser($pdo)
{
    if (!isLoggedIn()) return null;

    $stmt = $pdo->prepare("SELECT id, email, role FROM users WHERE email = :email");
    $stmt->execute([':email' => $_SESSION['email']]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
