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

    // Универсальный парсер входных данных
    function getInputData() {
        $jsonInput = json_decode(file_get_contents('php://input'), true);
        
        // Если есть JSON-данные, используем их
        if ($jsonInput !== null) {
            // Проверяем, находятся ли данные внутри поля userInfo
            if (isset($jsonInput['userInfo'])) {
                return [
                    'firstName' => $jsonInput['userInfo']['firstName'] ?? null,
                    'lastName' => $jsonInput['userInfo']['lastName'] ?? null, 
                    'email' => $jsonInput['userInfo']['email'] ?? null,
                    'position' => $jsonInput['userInfo']['position'] ?? null,
                    'stack' => $jsonInput['userInfo']['stack'] ?? null
                ];
            }
            return $jsonInput;
        }
        
        // Иначе собираем данные из всех возможных источников
        /*return [
            'firstName' => $_POST['firstName'] ?? $_GET['firstName'] ?? null,
            'lastName' => $_POST['lastName'] ?? $_GET['lastName'] ?? null,
            'email' => $_POST['email'] ?? $_GET['email'] ?? null,
            'position' => $_POST['position'] ?? $_GET['position'] ?? null,
            'stack' => $_POST['stack'] ?? $_GET['stack'] ?? null
        ];*/
    }

    switch($method) {
        case 'POST':
            $input = getInputData();
            
            $requiredFields = ['firstName', 'lastName', 'email', 'position', 'stack'];
            foreach ($requiredFields as $field) {
                if (empty($input[$field])) {
                    throw new Exception("Поле '$field' обязательно для заполнения");
                }
            }

            if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {// FILTER_VALIDATE_EMAIL встроенный в php фильтр
                throw new Exception('Неверный формат email');
            }

            $stack = $input['stack'];
            $stackString = $stack;

            $stmt = $pdo->prepare("UPDATE user_authorization SET 
                                firstName = :firstName, 
                                lastName = :lastName,
                                position = :position,
                                stack = :stack
                                WHERE email = :email");
            
            $stmt->execute([
                ':firstName' => $input['firstName'],
                ':lastName' => $input['lastName'],
                ':email' => $input['email'],
                ':position' => $input['position'],
                ':stack' => $stackString
            ]);

            if ($stmt->rowCount() === 0) {
                throw new Exception('Пользователь с указанным email не найден');
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Данные сотрудника успешно обновлены'
            ]);
            break;

        case 'GET':
            /*if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT id, firstName, lastname, email, position, stack FROM user_authorization WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } else {*/
                $stmt = $pdo->query("SELECT id, firstName, lastname, email, position, stack, avatar FROM user_authorization");
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            //}
            
            $teamMembers = [];
            foreach ($users as $user) {
                $stack = json_decode($user['stack'] ?? '', true) ?? [];
                
                $teamMembers[] = [
                    'id' => $user['id'],
                    'personData' => [
                        'firstName' => ($user['firstName']),
                        'lastName' => ($user['lastname']),
                        'email' => $user['email'],
                        'position' => $user['position'],
                        'stack' => $stack,
                        'avatar' => $user['avatar']
                    ]
                ];
            }

            $json = json_encode([
                'status' => 'success',
                'teamMembers' => $teamMembers
            ]);
           
            echo $json;
            break;
            
    }

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}