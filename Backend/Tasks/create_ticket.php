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

    $method = $_SERVER['REQUEST_METHOD'];

    switch($method) {
        case 'POST':
            // Создание новой задачи
            function getInputData() {
                $jsonInput = json_decode(file_get_contents('php://input'), true);
                
                // Если есть JSON-данные, используем их
                if ($jsonInput !== null) {
                    // Проверяем, находятся ли данные внутри поля userInfo
                    if (isset($jsonInput['ticket'])) {
                        return [
                            'name' => $jsonInput['ticket']['name'],
                            'status' => $jsonInput['ticket']['status'], 
                            'description' => $jsonInput['ticket']['description'],
                            'assignee' => $jsonInput['ticket']['assignee'],
                            'deadline' => $jsonInput['ticket']['deadline']
                        ];
                    }
                    return $jsonInput;
                }
            }
            $input = getInputData();
            // Если нет JSON-данных, берем из URL-параметров
            /*$input = $jsonInput; /*?: [
                'name' => $_POST['name'] ?? $_GET['name'] ?? null,
                'status' => $_POST['status'] ?? $_GET['status'] ?? null,
                'description' => $_POST['description'] ?? $_GET['description'] ?? null,
                'assignee' => $_POST['assignee'] ?? $_GET['assignee'] ?? null,
                'deadline' => $_POST['deadline'] ?? $_GET['deadline'] ?? null
            ];*/

            /*if (empty($input['name']) || empty($input['status']) || empty($input['description'])) {
                throw new Exception('Все поля обязательны для заполнения');
            }*/
            $stmt = $pdo->prepare("INSERT INTO tasks (name, status, description, assignee, deadline) 
                                 VALUES (:name, :status, :description, :assignee, :deadline)");
            
            $stmt->execute([
                ':name' => $input['name'],
                ':status' => $input['status'],
                ':description' => $input['description'],
                ':assignee' => $input['assignee'],
                ':deadline' => $input['deadline']
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Задача успешно создана',
                'id' => $pdo->lastInsertId()
            ]);
            break;

        case 'GET':
            // Получение списка задач
            $stmt = $pdo->query("SELECT * FROM tasks");
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'status' => 'success',
                'tasks' => $tasks
            ]);
            break;

        case 'PUT':
            // Обновление задачи
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['id'])) {
                throw new Exception('ID задачи обязателен');
            }

            $updateFields = [];
            $params = [];

            if (isset($input['name'])) {
                $updateFields[] = "name = :name";
                $params[':name'] = $input['name'];
            }
            if (isset($input['status'])) {
                $updateFields[] = "status = :status";
                $params[':status'] = $input['status'];
            }
            if (isset($input['description'])) {
                $updateFields[] = "description = :description";
                $params[':description'] = $input['description'];
            }
            if (isset($input['assignee'])) {
                $updateFields[] = "assignee = :assignee";
                $params[':assignee'] = $input['assignee'];
            }
            if (isset($input['deadline'])) {
                $updateFields[] = "deadline = :deadline";
                $params[':deadline'] = $input['deadline'];
            }

            if (!empty($updateFields)) {
                $params[':id'] = $input['id'];
                $sql = "UPDATE tasks SET " . implode(", ", $updateFields) . " WHERE id = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);

                echo json_encode([
                    'status' => 'success',
                    'message' => 'Задача успешно обновлена'
                ]);
            }
            break;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
