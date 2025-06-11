<?php

session_start();
require_once 'db.php';

$pdo = connectDB();
$method = $_SERVER['REQUEST_METHOD'];

function loginUser($pdo, $email, $password)
{
    $stmt = $pdo->prepare("SELECT id, email, password, role FROM users WHERE email = :email");
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
    return isset($_SESSION['user_id']);
}

function logoutUser()
{
    session_unset();
    session_destroy();
}

function getUserData()
{
    return [
        'user_id' => $_SESSION['user_id'] ?? null,
        'is_admin' => $_SESSION['is_admin'] ?? false
    ];
}
