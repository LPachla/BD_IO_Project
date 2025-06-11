<?php

require_once 'db.php';
header('Content-Type: application/json');

$pdo = connectDB();
$method = $_SERVER['REQUEST_METHOD'];

function loginUser(PDO $db, string $login, string $password): bool
{
    $stmt = $db->prepare('SELECT id, password_hash, is_admin FROM users WHERE login = :login');
    $stmt->execute([':login' => $login]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) return false;

    if (password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['is_admin'] = (bool)$user['is_admin'];
        return true;
    }
    return false;
}

function userExists(PDO $db, string $login): bool
{
    $stmt = $db->prepare('SELECT COUNT(*) FROM users WHERE login = :login');
    $stmt->execute([':login' => $login]);
    return $stmt->fetchColumn() > 0;
}

function isLoggedIn(): bool
{
    return isset($_SESSION['user_id']);
}

function isAdmin(): bool
{
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'];
}

function logoutUser(): void
{
    session_unset();
    session_destroy();
}

function getUserData(): array
{
    return [
        'user_id' => $_SESSION['user_id'] ?? null,
        'is_admin' => $_SESSION['is_admin'] ?? false
    ];
}
