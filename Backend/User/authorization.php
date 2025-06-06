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
        throw new Exception("Database file not found at: $dbPath");
    }
    
    if (!is_writable($dbPath)) {
        throw new Exception("Database file is not writable");
    }
    
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


    
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    if ($method === 'POST') {
        // Валидация входных данных
        if (empty($input['email']) || empty($input['password'])) {
            http_response_code(400);
            die(json_encode([
                'status' => 'error',
                'code' => 'MISSING_FIELDS',
                'message' => 'Email and password are required'
            ]));
        }

        $email = trim($input['email']);
        $password = trim($input['password']);

        // Проверка формата email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            die(json_encode([
                'status' => 'error',
                'code' => 'INVALID_EMAIL',
                'message' => 'Invalid email format'
            ]));
        }

        // Проверка существования пользователя
        $stmt = $pdo->prepare("SELECT id, email, created_at FROM [user_authorization] WHERE email = ?");
        $stmt = $pdo->prepare("SELECT id FROM [user_authorization] WHERE email = ?");
        $stmt->execute([$email]);
        $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingUser) {
            http_response_code(409);
            die(json_encode([
                'status' => 'error',
                'code' => 'EMAIL_EXISTS',
                'message' => 'User with this email already exists',
                'existing_user' => [
                    'id' => $existingUser['id'],
                    'email' => $existingUser['email'],
                    'registered_at' => $existingUser['created_at']
                ],
                'suggestions' => [
                    'Try logging in instead',
                    'Use password recovery if you forgot your password'
                ]
            ]));
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO [user_authorization] (email, password) VALUES (?, ?)");
        $stmt->execute([$email, $passwordHash]);
        $stmt = $pdo->prepare("INSERT INTO [user_authorization] (email, password) VALUES (?, ?)");
        $stmt->execute([$email, $password]);

        // Успешный ответ
        http_response_code(201);
        echo json_encode([
            'status' => 'success',
            'message' => 'User registered successfully',
            'user' => [
                'id' => $pdo->lastInsertId(),
                'email' => $email
            ],
            'timestamp' => date('c')
        ]);
        

    } elseif ($method === 'GET') {
        // Обработка GET-запроса
        if (isset($_GET['email']) && isset($_GET['password'])) {
            $email = $_GET['email'];
            $password = $_GET['password'];
            
            $stmt = $pdo->prepare("SELECT id, email, password FROM [user_authorization] WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && password_verify($password, $user['password'])) {
                // Генерируем токен
                $token = bin2hex(random_bytes(32));
                
                // Сохраняем токен в базе данных
                $stmt = $pdo->prepare("UPDATE [user_authorization] SET token = ?, token_created_at = CURRENT_TIMESTAMP WHERE id = ?");
                $stmt->execute([$token, $user['id']]);
                
                // Удаляем пароль из ответа
                unset($user['password']);
                
                echo json_encode([
                    'status' => 'success',
                    'user' => $user,
                    'token' => $token
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'code' => 'INVALID_CREDENTIALS',
                    'message' => 'Неверный email или пароль'
                ]);
            }
        } elseif (isset($_GET['token'])) {
            $token = $_GET['token'];
            
            $stmt = $pdo->prepare("SELECT id FROM [user_authorization] WHERE token = ? AND token_created_at > datetime('now', '-24 hours')");
            $stmt->execute([$token]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Token is valid'
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'code' => 'INVALID_TOKEN',
                    'message' => 'Invalid or expired token'
                ]);
            }
        } elseif (isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $pdo->prepare("SELECT id, firstName, lastname, email, position, stack FROM user_authorization WHERE id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                echo json_encode([
                    'status' => 'success',
                    'user' => $user
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
            http_response_code(400);
            die(json_encode([
                'status' => 'error',
                'code' => 'MISSING_PARAMETER',
                'message' => 'Требуется указать email и пароль или id'
            ]));
        }
    } else {
        http_response_code(405);
        die(json_encode([
            'status' => 'error',
            'code' => 'METHOD_NOT_ALLOWED',
            'message' => 'Only POST and GET methods are allowed'
        ]));
    }

} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode([
        'status' => 'error',
        'code' => 'DATABASE_ERROR',
        'message' => 'Database operation failed',
        'details' => $e->getMessage()
    ]));
} catch (Exception $e) {
    http_response_code(500);
    die(json_encode([
        'status' => 'error',
        'code' => 'SERVER_ERROR',
        'message' => 'Server error occurred',
        'details' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]));
}