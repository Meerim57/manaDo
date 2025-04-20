<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

// Путь к вашей базе данных
$dbPath = '/!!!LABS/DIPLOMBD/diplom.bd';

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handlePostRequest($pdo);
        break;
    case 'GET':
        handleGetRequest($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function handlePostRequest($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }

    $email = trim($data['email']);
    $password = password_hash(trim($data['password']), PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO [user/authorization] (email, password) VALUES (:email, :password)");
        $stmt->execute(['email' => $email, 'password' => $password]);

        http_response_code(201);
        echo json_encode([
            'id' => $pdo->lastInsertId(),
            'email' => $email,
            'message' => 'User registered successfully'
        ]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
    }
}

function handleGetRequest($pdo) {
    $id = $_GET['id'] ?? null;
    $email = $_GET['email'] ?? null;

    if (!$id && !$email) {
        http_response_code(400);
        echo json_encode(['error' => 'ID or Email parameter is required']);
        return;
    }

    try {
        $query = "SELECT id, email FROM [user/authorization] WHERE ";
        $params = [];

        if ($id) {
            $query .= "id = :id";
            $params['id'] = $id;
        } else {
            $query .= "email = :email";
            $params['email'] = $email;
        }

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}