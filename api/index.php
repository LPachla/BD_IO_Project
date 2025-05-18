<?php

require_once 'db.php';
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

            default:
                echo json_encode(['error' => 'Unknown action']);
        }
        } else {
            echo json_encode(['error' => 'No parametr "action"']);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data) {
            $id = insertAtrakcje($pdo, $data);
            echo json_encode(['message' => 'Inserted Attraction', 'id' => $id]);
        } else {
            echo json_encode(['error' => 'Invalid input']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data && isset($data['id'])) {
            $count = updateAtrakcje($pdo, $data);
            echo json_encode(['message' => 'Updated Attraction', 'rows_affected' => $count]);
        } else {
            echo json_encode(['error' => 'Invalid input']);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data && isset($data['id'])) {
            $count = deleteAtrakcje($pdo, $data['id']);
            echo json_encode(['message' => 'Deleted Attraction', 'rows_affected' => $count]);
        } else {
            echo json_encode(['error' => 'Invalid input']);
        }
        break;

    default:
        echo json_encode(['error' => 'Unsupported method']);
        break;
}
