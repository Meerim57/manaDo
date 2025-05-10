<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
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
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['name']) || empty($input['lastName']) || empty($input['email']) || 
                empty($input['position']) || empty($input['stack'])) {
                throw new Exception('Все поля обязательны для заполнения');
            }

            // Проверка формата email
            if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Неверный формат email');
            }

            // Преобразование массива stack в строку для хранения
            $stackString = json_encode($input['stack']);

            $stmt = $pdo->prepare("INSERT INTO persons (name, lastName, email, position, stack) 
                                 VALUES (:name, :lastName, :email, :position, :stack)");
            
            $stmt->execute([
                ':name' => $input['name'],
                ':lastName' => $input['lastName'],
                ':email' => $input['email'],
                ':position' => $input['position'],
                ':stack' => $stackString
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Сотрудник успешно добавлен',
                'person_id' => $pdo->lastInsertId()
            ]);
            break;

        case 'GET':
            $stmt = $pdo->query("SELECT * FROM persons");
            $persons = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Преобразование строки stack обратно в массив для каждого сотрудника
            $teamMembers = [];
            foreach ($persons as $person) {
                $teamMember = [
                    'id' => $person['id'],
                    'personData' => [
                        'name' => $person['name'],
                        'lastName' => $person['lastName'],
                        'email' => $person['email'],
                        'position' => $person['position'],
                        'stack' => json_decode($person['stack'])
                    ]
                ];
                $teamMembers[] = $teamMember;
            }
            
            echo json_encode([
                'status' => 'success',
                'team-members' => $teamMembers
            ]);
            break;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
