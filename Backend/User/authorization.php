<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");

// Включение отображения ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Обработка preflight-запроса OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Подключение к SQLite базе данных
    $dbPath = realpath(__DIR__ . '/../DIPLOMBD/diplom.db');
    if (!is_writable($dbPath)) {
        die(json_encode([
            'error' => 'Database is not writable',
            'db_path' => $dbPath
        ]));
    }
    // Проверка существования файла БД
    if (!file_exists($dbPath)) {
        throw new Exception("Database file not found at: $dbPath");
    }
    
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    if ($method === 'POST') {
        // Валидация входных данных
        if (empty($input['email']) || empty($input['password'])) {
            http_response_code(400);
            die(json_encode(['error' => 'Email and password are required']));
        }

        $email = trim($input['email']);
        $password = password_hash(trim($input['password']), PASSWORD_DEFAULT);

        // Проверка существования пользователя
        $stmt = $pdo->prepare("SELECT id FROM [user_authorization] WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->fetch()) {
            http_response_code(400);
            die(json_encode(['error' => 'User with this email already exists']));
        }

        // Создание нового пользователя
        $stmt = $pdo->prepare("INSERT INTO [user_authorization] (email, password) VALUES (?, ?)");
        $stmt->execute([$email, $password]);

        // Успешный ответ
        http_response_code(201);
        echo json_encode([
            'id' => $pdo->lastInsertId(),
            'email' => $email,
            'message' => 'User registered successfully'
        ]);

    } elseif ($method === 'GET') { //дописать во фронт 
        // Обработка GET-запроса
        if (isset($_GET['email'])) {
            $email = $_GET['email'];
            $stmt = $pdo->prepare("SELECT id, email FROM [user_authorization] WHERE email = ?");
            $stmt->execute([$email]);
        } elseif (isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $pdo->prepare("SELECT id, email FROM [user_authorization] WHERE id = ?");
            $stmt->execute([$id]);
        } else {
            http_response_code(400);
            die(json_encode(['error' => 'Email or ID parameter is required']));
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        echo $user ? json_encode($user) : json_encode(['error' => 'User not found']);
    } else {
        http_response_code(405);
        die(json_encode(['error' => 'Method not allowed']));
    }

} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode([
        'error' => 'Database error',
        'details' => $e->getMessage(),
        'db_path' => $dbPath
    ]));
} catch (Exception $e) {
    http_response_code(500);
    die(json_encode([
        'error' => 'Server error',
        'details' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]));
}