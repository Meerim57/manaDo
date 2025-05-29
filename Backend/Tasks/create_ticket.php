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
            $stmt = $pdo->prepare("INSERT INTO tasks (name, status, description, assignee, deadline, created_at) 
                                 VALUES (:name, :status, :description, :assignee, :deadline, CURRENT_TIMESTAMP)");
            
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
            if (isset($_GET['id_user'])){ // получение сделки по id пользователя
                // Сначала удаляем старые задачи
                /*$stmt = $pdo->prepare("SELECT * FROM tasks WHERE datetime(deadline) < datetime('now', '-14 days')");
                $stmt->execute();
                $user_tickets_old = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'status' => 'success',
                    'user_tickets_old' => $user_tickets_old
                ]);
                if($user_tickets_old){
                    $stmt = $pdo->prepare("DELETE FROM tasks WHERE datetime(deadline) < datetime('now', '-14 days')");
                    $stmt->execute();
                }*/
                
                $user_id = $_GET['id_user'];
                $stmt = $pdo->prepare("SELECT * FROM tasks WHERE assignee = ? ORDER BY id DESC");
                $stmt->execute([$user_id]);
                $user_tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
                if ($user_tickets) {
                    echo json_encode([
                        'status' => 'success',
                        'user_tickets' => $user_tickets
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'status' => 'error',
                        'code' => 'USER_NOT_FOUND',
                        'message' => 'Пользователь не найден'
                    ]);
                }
            } else {
                $stmt = $pdo->prepare("SELECT * FROM tasks WHERE datetime(deadline) < datetime('now', '-14 days')");
                $stmt->execute();
                $user_tickets_old = $stmt->fetchAll(PDO::FETCH_ASSOC);

                /*echo json_encode([
                    'status' => 'success',
                    'user_tickets_old' => $user_tickets_old
                ]);*/
                // Сначала удаляем старые задачи
                if ($user_tickets_old != null) {
                    $stmt = $pdo->prepare("DELETE FROM tasks WHERE datetime(deadline) < datetime('now', '-14 days')");
                    $stmt->execute();
                }
                
                // Получение списка задач
                $stmt = $pdo->query("SELECT * FROM tasks");
                $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'status' => 'success',
                    'tasks' => $tasks
                ]);
            }
            break;
        case 'PUT':
            // Обновление задачи
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['id'])) {
               break;
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
