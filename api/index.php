<?php

session_start();
require_once 'db.php';
require_once 'auth.php';
header('Content-Type: application/json');

$pdo = connectDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'powiaty':
                    $result = getPowiaty($pdo);
                    echo json_encode($result);
                    break;

                case 'atrakcje':
                    $result = getAtrakcje($pdo);
                    echo json_encode($result);
                    break;

                case 'zdjecia':
                    $result = getZdjecia($pdo);
                    echo json_encode($result);
                    break;

                case 'getPowiatIDFromName':
                    if (isset($_GET['powiat'])) {
                        $data = ['powiat' => $_GET['powiat']];
                        $result = getPowiatIDFromName($pdo, $data);
                        echo json_encode($result);
                    } else {
                        echo json_encode(['error' => 'Invalid input']);
                    }
                    break;
                case 'getUser':
                    $result = getUserData();
                    echo json_encode($result);
                    break;

                default:
                    echo json_encode(['error' => 'Unknown action']);
            }
        } else {
            echo json_encode(['error' => 'No parameter "action"']);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'login':
                    if (isset($data['email'], $data['password'])) {
                        $user = loginUser($pdo, $data['email'], $data['password']);
                        if ($user) {
                            $_SESSION['user_id'] = $user['id'];
                            $_SESSION['is_admin'] = $user['role'] === 'admin';
                            echo json_encode(['message' => 'Login successful', 'user' => $user]);
                        } else {
                            echo json_encode(['error' => 'Invalid email or password']);
                        }
                    } else {
                        echo json_encode(['error' => 'Email and password are required']);
                    }
                    break;

                case 'insertAtrakcje':
                    if (isLoggedIn() && isAdmin($user)) {
                        if (isset($data['nazwa'], $data['powiat_id'])) {
                            $id = insertAtrakcje($pdo, $data, $user);
                            echo json_encode(['message' => 'Inserted Attraction', 'id' => $id]);
                        } else {
                            echo json_encode(['error' => 'Invalid input']);
                        }
                    } else {
                        echo json_encode(['error' => 'Permission denied, only admin can add attractions']);
                    }
                    break;
                case 'createUser':
                    $result = createUser($pdo, $data);
                    echo json_encode($result);
                    break;
                case 'logout':
                    logoutUser();
                    echo json_encode(['message' => 'Logged out']);
                    break;


                default:
                    echo json_encode(['error' => 'Unknown action']);
            }
        } else {
            echo json_encode(['error' => 'No action specified']);
        }
        break;

    case 'PUT':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'updateUser':
                    $data = json_decode(file_get_contents('php://input'), true);
                    if ($data && isset($data['id'], $data['login'], $data['password'])) {
                        $count = updateUser($pdo, $data);
                        echo json_encode(['message' => 'User updated', 'rows_affected' => $count]);
                    } else {
                        echo json_encode(['error' => 'Invalid input']);
                    }
                    break;

                default:
                    echo json_encode(['error' => 'Unknown action']);
            }
        } else {
            echo json_encode(['error' => 'No action specified']);
        }
        break;

    case 'DELETE':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'deleteUser':
                    $data = json_decode(file_get_contents('php://input'), true);
                    if ($data && isset($data['id'])) {
                        $count = deleteUser($pdo, $data['id']);
                        echo json_encode(['message' => 'User deleted', 'rows_affected' => $count]);
                    } else {
                        echo json_encode(['error' => 'Invalid input']);
                    }
                    break;

                default:
                    echo json_encode(['error' => 'Unknown action']);
            }
        } else {
            echo json_encode(['error' => 'No action specified']);
        }
        break;

    default:
        echo json_encode(['error' => 'Unsupported method']);
        break;
}
