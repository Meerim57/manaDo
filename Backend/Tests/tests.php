<?php

class BackendTests {
    private $pdo;
    private $baseUrl = 'http://localhost:8000/Backend';
    
    public function setUp() {
        $dbPath = realpath(__DIR__ . '/../DIPLOMBD/diplom.db');
        if (!$dbPath) {
            throw new Exception("Не удалось найти путь к базе данных");
        }
        $this->pdo = new PDO("sqlite:$dbPath");
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function runAllTests() {
        $results = [];
        
        // Запускаем все тесты по порядку
        $results[] = $this->runTest('testUserRegistration');
        $results[] = $this->runTest('testInvalidEmailFormat');
        $results[] = $this->runTest('testCreateTicket');
        $results[] = $this->runTest('testUpdateTicket');
        $results[] = $this->runTest('testUpdateUserProfile');
        
        return $results;
    }

    private function runTest($testName) {
        try {
            $this->$testName();
            return ['test' => $testName, 'status' => 'passed'];
        } catch (Exception $e) {
            return ['test' => $testName, 'status' => 'failed', 'message' => $e->getMessage()];
        }
    }

    // Тесты для авторизации
    private function testUserRegistration() {
        try {
            $testData = [
                'email' => 'test@test.com',
                'password' => 'test123'
            ];

            $response = $this->makeRequest('/User/authorization.php', 'POST', $testData);
            $result = json_decode($response, true);

            if (!is_array($result) || $result['status'] !== 'success') {
                throw new Exception('Неверный статус ответа: ' . print_r($response, true));
            }
            if (empty($result['user']['id'])) {
                throw new Exception('ID пользователя пустой: ' . print_r($response, true));
            }
            if ($result['user']['email'] !== $testData['email']) throw new Exception('Email не совпадает');
            
            echo "Тест регистрации пользователя успешно пройден\n";
        } catch (Exception $e) {
            throw new Exception("Тест регистрации пользователя не пройден: " . $e->getMessage());
        }
    }

    private function testInvalidEmailFormat() {
        try {
            $testData = [
                'email' => 'invalid_email',
                'password' => 'test123'
            ];

            $response = $this->makeRequest('/User/authorization.php', 'POST', $testData);
            $result = json_decode($response, true);

            if (!is_array($result) || $result['status'] !== 'error') throw new Exception('Неверный статус ответа');
            if ($result['code'] !== 'INVALID_EMAIL') throw new Exception('Неверный код ошибки');
            
            echo "Тест проверки формата email успешно пройден\n";
        } catch (Exception $e) {
            throw new Exception("Тест проверки формата email не пройден: " . $e->getMessage());
        }
    }

    // Тесты для работы с задачами
    private function testCreateTicket() {
        try {
            $testTicket = [
                'ticket' => [
                    'name' => 'Test Task',
                    'status' => 'new',
                    'description' => 'Test Description', 
                    'assignee' => 'test@test.com',
                    'deadline' => '2024-01-01'
                ]
            ];

            $response = $this->makeRequest('/Tasks/create_ticket.php', 'POST', $testTicket);
            $result = json_decode($response, true);

            if (!is_array($result) || $result['status'] !== 'success') throw new Exception('Неверный статус ответа');
            if (empty($result['id'])) throw new Exception('ID задачи пустой');
            
            echo "Тест создания задачи успешно пройден\n";
        } catch (Exception $e) {
            throw new Exception("Тест создания задачи не пройден: " . $e->getMessage());
        }
    }

    private function testUpdateTicket() {
        try {
            // Сначала создаем тестовую задачу
            $testTicket = [
                'ticket' => [
                    'name' => 'Test Task Update',
                    'status' => 'new',
                    'description' => 'Test Description',
                    'assignee' => 'test@test.com',
                    'deadline' => '2024-01-01'
                ]
            ];

            $response = $this->makeRequest('/Tasks/create_ticket.php', 'POST', $testTicket);
            $result = json_decode($response, true);
            if (!is_array($result) || empty($result['id'])) throw new Exception('ID задачи пустой');
            $taskId = $result['id'];

            // Обновляем задачу
            $updateData = [
                'id' => $taskId,
                'status' => 'in_progress'
            ];

            $response = $this->makeRequest('/Tasks/create_ticket.php', 'PUT', $updateData);
            $result = json_decode($response, true);

            if (!is_array($result) || $result['status'] !== 'success') throw new Exception('Неверный статус ответа');
            
            echo "Тест обновления задачи успешно пройден\n";
        } catch (Exception $e) {
            throw new Exception("Тест обновления задачи не пройден: " . $e->getMessage());
        }
    }

    // Тесты для профиля пользователя
    private function testUpdateUserProfile() {
        try {
            $testProfile = [
                'userInfo' => [
                    'firstName' => 'Test',
                    'lastName' => 'User',
                    'email' => 'test@test.com',
                    'occupation' => 'Developer',
                    'stack' => ['PHP', 'JavaScript']
                ]
            ];

            $response = $this->makeRequest('/User/person.php', 'POST', $testProfile);
            $result = json_decode($response, true);

            if (!is_array($result) || $result['status'] !== 'success') throw new Exception('Неверный статус ответа');
            
            echo "Тест обновления профиля пользователя успешно пройден\n";
        } catch (Exception $e) {
            throw new Exception("Тест обновления профиля пользователя не пройден: " . $e->getMessage());
        }
    }

    private function makeRequest($endpoint, $method, $data = null) {
        $ch = curl_init($this->baseUrl . $endpoint);
        
        $options = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json']
        ];

        if ($data) {
            $options[CURLOPT_POSTFIELDS] = json_encode($data);
        }

        curl_setopt_array($ch, $options);
        $response = curl_exec($ch);
        if ($response === false) {
            throw new Exception('Ошибка выполнения запроса: ' . curl_error($ch));
        }
        curl_close($ch);

        return $response;
    }

    /*public function tearDown() {
        try {
            // Очистка тестовых данных через существующие эндпоинты
            $this->makeRequest('/Tasks/create_ticket.php', 'DELETE', ['name' => 'Test Task']);
            $this->makeRequest('/Tasks/create_ticket.php', 'DELETE', ['name' => 'Test Task Update']);
        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Failed to connect to localhost') !== false) {
                throw new Exception("Ошибка при очистке тестовых данных: Ошибка выполнения запроса: " . $e->getMessage());
            } else {
                throw new Exception("Ошибка при очистке тестовых данных: " . $e->getMessage());
            }
        }
    }*/
}

// Запуск тестов только при обращении к файлу через URL
if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json');
    
    $testRunner = new BackendTests();
    try {
        $testRunner->setUp();
        $results = $testRunner->runAllTests();
        //$testRunner->tearDown();
        
        echo json_encode([
            'status' => 'completed',
            'tests' => $results,
            'summary' => [
                'total' => count($results),
                'passed' => count(array_filter($results, fn($r) => $r['status'] === 'passed')),
                'failed' => count(array_filter($results, fn($r) => $r['status'] === 'failed'))
            ]
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
}