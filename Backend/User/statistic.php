<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");

error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $dbPath = realpath(__DIR__ . '/../DIPLOMBD/diplom.db');
    
    if (!file_exists($dbPath)) {
        throw new Exception("База данных не найдена: $dbPath");
    }
    
    if (!is_writable($dbPath)) {
        throw new Exception("База данных недоступна для записи");
    }
    
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['user_id'])) {
            $user_id = $_GET['user_id'];

            $stmt = $pdo->prepare("
                SELECT * FROM tasks 
                WHERE assignee = ? 
                AND status = 'completed'
                ORDER BY created_at DESC
            ");
            $stmt->execute([$user_id]);
            $completed_tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $stmt = $pdo->prepare("
                SELECT * FROM tasks 
                WHERE assignee = ? 
                AND status != 'Закончено'
                AND deadline < datetime('now')
                ORDER BY deadline ASC
            ");
            $stmt->execute([$user_id]);
            $overdue_tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $statistics = [
                'completed_tasks' => [
                    'count' => count($completed_tasks),
                    'tasks' => $completed_tasks
                ],
                'overdue_tasks' => [
                    'count' => count($overdue_tasks),
                    'tasks' => $overdue_tasks
                ],
                'total_tasks' => count($completed_tasks) + count($overdue_tasks),
                'completion_rate' => count($completed_tasks) > 0 
                    ? round((count($completed_tasks) / (count($completed_tasks) + count($overdue_tasks))) * 100, 2)
                    : 0
            ];

            echo json_encode([
                'status' => 'success',
                'statistics' => $statistics
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Не указан ID пользователя'
            ]);
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

