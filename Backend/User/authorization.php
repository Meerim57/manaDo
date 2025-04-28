<?php
ob_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

try {
    $pdo = new PDO("/!DIPLOMBD/diplom.db");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных: ' . $e->getMessage()]);
    exit;
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        handlePostRequest($pdo);
        break;
    case 'GET':
        handleGetRequest($pdo);
        break;
    default:
        ob_end_clean();
        http_response_code(405);
        echo json_encode(['error' => 'Метод не разрешен']);
        break;
}

function handlePostRequest($pdo) {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if ($data === null) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Неверные данные JSON']);
        return;
    }
    
    if (!isset($data['email']) || !isset($data['password'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Email и пароль обязательны']);
        return;
    }
    
    $email = trim($data['email']);
    $password = password_hash(trim($data['password']), PASSWORD_DEFAULT);

    try {
        // Проверяем, существует ли пользователь
        $checkStmt = $pdo->prepare("SELECT id FROM [user/authorization] WHERE email = :email");
        $checkStmt->execute(['email' => $email]);
        
        if ($checkStmt->fetch()) {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['error' => 'Пользователь с таким email уже существует']);
            return;
        }

        // Добавляем нового пользователя
        $stmt = $pdo->prepare("INSERT INTO [user/authorization] (email, password) VALUES (:email, :password)");
        $stmt->execute([
            'email' => $email,
            'password' => $password
        ]);

        $userId = $pdo->lastInsertId();

        // Создаем JWT токен
        $issuedAt = time();
        $expirationTime = $issuedAt + 3600; // Токен действителен 1 час
        
        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'user_id' => $userId,
            'email' => $email
        ];

        $secretKey = "ваш_секретный_ключ";
        $jwt = generateJWT($payload, $secretKey);

        ob_end_clean();
        http_response_code(201);
        echo json_encode([
            'token' => $jwt,
            'user' => [
                'id' => $userId,
                'email' => $email
            ],
            'message' => 'Пользователь успешно зарегистрирован'
        ]);

    } catch (PDOException $e) {
        ob_end_clean();
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка базы данных: ' . $e->getMessage()]);
    }
}

function handleGetRequest($pdo) {
    $token = getBearerToken();
    
    if (!$token) {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['error' => 'Токен не предоставлен']);
        return;
    }

    try {
        $secretKey = "ваш_секретный_ключ";
        $payload = verifyJWT($token, $secretKey);
        
        if (!$payload) {
            ob_end_clean();
            http_response_code(401);
            echo json_encode(['error' => 'Недействительный токен']);
            return;
        }

        $stmt = $pdo->prepare("SELECT id, email FROM [user/authorization] WHERE id = :id");
        $stmt->execute(['id' => $payload['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        ob_end_clean();
        if ($user) {
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден']);
        }
    } catch (Exception $e) {
        ob_end_clean();
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка сервера: ' . $e->getMessage()]);
    }
}

function generateJWT($payload, $secretKey) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $header = base64_encode($header);
    
    $payload = json_encode($payload);
    $payload = base64_encode($payload);
    
    $signature = hash_hmac('sha256', "$header.$payload", $secretKey, true);
    $signature = base64_encode($signature);
    
    return "$header.$payload.$signature";
}

function verifyJWT($token, $secretKey) {
    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        return false;
    }
    
    $header = base64_decode($parts[0]);
    $payload = base64_decode($parts[1]);
    $signature = $parts[2];
    
    $verifySignature = base64_encode(
        hash_hmac('sha256', "$parts[0].$parts[1]", $secretKey, true)
    );
    
    if ($signature !== $verifySignature) {
        return false;
    }
    
    $payload = json_decode($payload, true);
    
    if ($payload['exp'] < time()) {
        return false;
    }
    
    return $payload;
}

function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}

ob_end_flush();
?>
