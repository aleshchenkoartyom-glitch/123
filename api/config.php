<?php
/**
 * Конфигурация базы данных и настройки API
 * 
 * ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:
 * 1. Создайте базу данных MySQL с именем 'factory_game'
 * 2. Измените параметры подключения ниже на ваши
 * 3. Запустите api/install.php для создания таблиц
 */

// ===================== НАСТРОЙКИ БД =====================
define('DB_HOST', 'localhost');      // Хост базы данных (обычно localhost)
define('DB_NAME', 'factory_game');   // Имя базы данных
define('DB_USER', 'root');           // Имя пользователя MySQL
define('DB_PASS', '');               // Пароль MySQL (оставьте пустым для локального XAMPP/MAMP)
define('DB_CHARSET', 'utf8mb4');     // Кодировка

// ===================== НАСТРОЙКИ API =====================
define('JWT_SECRET', 'your-super-secret-key-change-this-in-production-123!@#');
define('JWT_EXPIRY', 86400 * 7); // 7 дней в секундах

// ===================== CORS =====================
// Разрешаем запросы с фронтенда (измените на ваш домен в продакшене)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ===================== ПОДКЛЮЧЕНИЕ К БД =====================
function getDB(): PDO {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit();
        }
    }
    
    return $pdo;
}

// ===================== УТИЛИТЫ =====================
function jsonResponse($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function jsonError(string $message, int $code = 400): void {
    jsonResponse(['error' => $message], $code);
}

function getJsonInput(): array {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return is_array($data) ? $data : [];
}

// ===================== JWT ФУНКЦИИ =====================
function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function createJWT(array $payload): string {
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    
    $headerEncoded = base64UrlEncode(json_encode($header));
    $payloadEncoded = base64UrlEncode(json_encode($payload));
    
    $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
    $signatureEncoded = base64UrlEncode($signature);
    
    return "$headerEncoded.$payloadEncoded.$signatureEncoded";
}

function verifyJWT(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;
    
    $signature = base64UrlDecode($signatureEncoded);
    $expectedSignature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
    
    if (!hash_equals($expectedSignature, $signature)) return null;
    
    $payload = json_decode(base64UrlDecode($payloadEncoded), true);
    
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

function getAuthUser(): ?array {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (preg_match('/Bearer\s+(.+)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        $payload = verifyJWT($token);
        
        if ($payload && isset($payload['user_id'])) {
            $db = getDB();
            $stmt = $db->prepare("SELECT id, username, email, is_admin, created_at FROM users WHERE id = ?");
            $stmt->execute([$payload['user_id']]);
            return $stmt->fetch() ?: null;
        }
    }
    
    return null;
}

function requireAuth(): array {
    $user = getAuthUser();
    if (!$user) {
        jsonError('Unauthorized', 401);
    }
    return $user;
}

function requireAdmin(): array {
    $user = requireAuth();
    if (!$user['is_admin']) {
        jsonError('Admin access required', 403);
    }
    return $user;
}
