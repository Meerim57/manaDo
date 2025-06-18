<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_FILES['avatar']) || !isset($_POST['userId'])) {
            throw new Exception("Missing required fields");
        }

        $userId = $_POST['userId'];
        $file = $_FILES['avatar'];
        
        // Проверка типа файла
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($file['type'], $allowedTypes)) {
            throw new Exception("Invalid file type. Only JPG, PNG and GIF are allowed.");
        }

        // Создаем директорию для аватарок, если её нет
        $uploadDir = __DIR__ . '/../uploads/avatars/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Генерируем имя файла
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $avatarPath = "avatar{$userId}.{$extension}";
        $fullPath = $uploadDir . $avatarPath;

        // Перемещаем файл
        if (move_uploaded_file($file['tmp_name'], $fullPath)) {
            // Обновляем путь к аватарке в базе данных
            $stmt = $pdo->prepare("UPDATE user_authorization SET avatar = ? WHERE id = ?");
            $stmt->execute([$avatarPath, $userId]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Avatar uploaded successfully',
                'avatarPath' => $avatarPath
            ]);
        } else {
            throw new Exception("Failed to move uploaded file");
        }
    } else {
        throw new Exception("Method not allowed");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 