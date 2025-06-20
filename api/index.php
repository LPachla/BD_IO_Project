<?php

if (session_id() == '') {
    session_start();
}
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
                            $_SESSION['id'] = $user['id'];
                            $_SESSION['role'] = $user['role'];
                            $_SESSION['email'] = $user['email'];
                            $_SESSION['password'] = $user['password'];
                            $_SESSION['imie'] = $user['imie'];
                            $_SESSION['nazwisko'] = $user['nazwisko'];
                            echo json_encode(['message' => 'Login successful', 'user' => $user]);
                        } else {
                            echo json_encode(['error' => 'Invalid email or password']);
                        }
                    } else {
                        echo json_encode(['error' => 'Email and password are required']);
                    }
                    break;

                case 'insertAtrakcje':
                    if (!isLoggedIn()) {
                        echo json_encode(['error' => 'Not logged in']);
                        break;
                    }
                    if ($_SESSION['role'] !== 'admin') {
                        echo json_encode(['error' => 'Permission denied, only admin can add attractions']);
                        break;
                    }

                    $required = ['nazwa', 'powiat', 'typ', 'opis', 'lokalizacjaX', 'lokalizacjaY', 'ocena'];
                    $missing = [];
                    foreach ($required as $key) {
                        if (!isset($_POST[$key]) || empty($_POST[$key])) {
                            $missing[] = $key;
                        }
                    }
                    if (count($missing) > 0) {
                        echo json_encode(['error' => 'Missing input data: ' . implode(', ', $missing)]);
                        break;
                    }

                    if (!isset($_FILES['zdjecie'])) {
                        echo json_encode(['error' => 'Missing image file']);
                        break;
                    }

                    $pdo->beginTransaction();
                    try {
                        $stmt = $pdo->prepare("INSERT INTO atrakcje (nazwa, powiat, typ, opis, lokalizacjaX, lokalizacjaY, ocena)
                                            VALUES (:nazwa, :powiat, :typ, :opis, :lokalizacjaX, :lokalizacjaY, :ocena) RETURNING id");
                        $stmt->execute([
                            ':nazwa' => $_POST['nazwa'],
                            ':powiat' => $_POST['powiat'],
                            ':typ' => $_POST['typ'],
                            ':opis' => $_POST['opis'],
                            ':lokalizacjaX' => $_POST['lokalizacjaX'],
                            ':lokalizacjaY' => $_POST['lokalizacjaY'],
                            ':ocena' => $_POST['ocena'],
                        ]);
                        $atrakcjaId = $stmt->fetchColumn();

                        $uploadDir = '/img/';
                        if (!is_dir($uploadDir)) {
                            mkdir($uploadDir, 0777, true);
                        }

                        $file = $_FILES['zdjecie'];
                        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
                        $uniqueName = $atrakcjaId. '.' .$ext;
                        $targetPath = $uploadDir . $uniqueName;

                        if (!rename($file['tmp_name'], $targetPath)) {
                            throw new Exception('Failed to move uploaded file');
                        }
                        chmod($targetPath, 0777);

                        $stmt = $pdo->prepare("INSERT INTO zdjecia (atrakcja, zdjecia) VALUES (:atrakcja, :zdjecia)");
                        $stmt->execute([
                            ':atrakcja' => $atrakcjaId,
                            ':zdjecia' => $uniqueName
                        ]);

                        $pdo->commit();

                        echo json_encode(['message' => 'Inserted Attraction and Image', 'atrakcja_id' => $atrakcjaId, 'filename' => $uniqueName]);
                    } catch (Exception $e) {
                        $pdo->rollBack();
                        echo json_encode(['error' => 'Transaction failed: ' . $e->getMessage()]);
                    }
                    break;

                case 'createUser':
                    $required = ['email', 'password', 'imie', 'nazwisko'];
                    $missing = [];

                    foreach ($required as $key) {
                        if (empty($data[$key])) {
                            $missing[] = $key;
                        }
                    }

                    if (count($missing) === 0) {
                        $data['role'] = 'user';
                        $result = createUser($pdo, $data);
                        echo json_encode($result);
                    } else {
                        echo json_encode(['error' => 'Missing input data: ' . implode(', ', $missing)]);
                    }
                    break;

                case 'logout':
                    if (isLoggedIn()) {
                        logoutUser();
                        echo json_encode(['message' => 'Logged out']);
                    } else {
                        echo json_encode(['error' => "Can't log out - user not logged in"]);
                    }

                    break;
                case 'updateUser':
                    $data = json_decode(file_get_contents('php://input'), true);

                    if (!isLoggedIn()) {
                        echo json_encode(['error' => 'Unauthorized']);
                        break;
                    }

                    $currentUserId = $_SESSION['id'];
                    $currentUserRole = $_SESSION['role'] ?? 'user';

                    $isOwnAccount = isset($data['id']) && $currentUserId == $data['id'];
                    $isTryingToChangeRole = isset($data['role']) && $data['role'] !== $currentUserRole;

                    if (!$isOwnAccount && $currentUserRole !== 'admin') {
                        echo json_encode(['error' => 'Permission denied']);
                        break;
                    }

                    if ($isTryingToChangeRole && $currentUserRole !== 'admin') {
                        echo json_encode(['error' => 'Only admin can change user roles']);
                        break;
                    }

                    $count = updateUser($pdo, $data);
                    echo json_encode(['message' => 'User updated', 'rows_affected' => $count]);
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
                    if ($data && isset($data['email'])) {
                        $count = deleteUser($pdo, $data['email']);
                        if ($count >= 0) {
                            echo json_encode(['message' => 'User deleted', 'rows_affected' => $count]);
                        } else {
                            echo json_encode($count);
                        }
                    } else {
                        echo json_encode(['error' => 'Invalid input']);
                    }
                    break;
                case 'deleteAtrakcje':
                    $data = json_decode(file_get_contents('php://input'), true);
                    if ($data && isset($data['id'])) {
                        $photos = deleteZdjecia($pdo, $data['id']);
                        $count = deleteAtrakcje($pdo, $data['id']);
                        if($count >= 0){
                            echo json_encode(['message' => 'Attraction deleted', 'rows_affected' => $count, 'photos_deleted' => $photos]);
                        }else{
                            echo json_encode($count);
                        }
                        
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
