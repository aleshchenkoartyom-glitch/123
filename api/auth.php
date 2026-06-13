<?php
/**
 * API авторизации: регистрация, вход, проверка токена
 */
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'register':
        handleRegister();
        break;
    case 'login':
        handleLogin();
        break;
    case 'me':
        handleMe();
        break;
    case 'logout':
        handleLogout();
        break;
    default:
        jsonError('Unknown action', 404);
}

// ===================== РЕГИСТРАЦИЯ =====================
function handleRegister(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed', 405);
    }
    
    $input = getJsonInput();
    
    $username = trim($input['username'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    // Валидация
    if (strlen($username) < 3 || strlen($username) > 50) {
        jsonError('Имя пользователя должно быть от 3 до 50 символов');
    }
    
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        jsonError('Имя пользователя может содержать только буквы, цифры и _');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonError('Некорректный email');
    }
    
    if (strlen($password) < 6) {
        jsonError('Пароль должен быть минимум 6 символов');
    }
    
    $db = getDB();
    
    // Проверяем уникальность
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    
    if ($stmt->fetch()) {
        jsonError('Пользователь с таким именем или email уже существует');
    }
    
    // Создаем пользователя
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $db->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$username, $email, $passwordHash]);
    
    $userId = $db->lastInsertId();
    
    // Создаем токен
    $token = createJWT(['user_id' => $userId, 'username' => $username]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Регистрация успешна',
        'token' => $token,
        'user' => [
            'id' => (int)$userId,
            'username' => $username,
            'email' => $email,
            'is_admin' => false
        ]
    ]);
}

// ===================== ВХОД =====================
function handleLogin(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed', 405);
    }
    
    $input = getJsonInput();
    
    $login = trim($input['login'] ?? ''); // username или email
    $password = $input['password'] ?? '';
    
    if (empty($login) || empty($password)) {
        jsonError('Введите логин и пароль');
    }
    
    $db = getDB();
    
    // Ищем по username или email
    $stmt = $db->prepare("SELECT id, username, email, password_hash, is_admin FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$login, $login]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonError('Неверный логин или пароль', 401);
    }
    
    // Создаем токен
    $token = createJWT([
        'user_id' => $user['id'],
        'username' => $user['username'],
        'is_admin' => (bool)$user['is_admin']
    ]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Вход выполнен',
        'token' => $token,
        'user' => [
            'id' => (int)$user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'is_admin' => (bool)$user['is_admin']
        ]
    ]);
}

// ===================== ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ =====================
function handleMe(): void {
    $user = requireAuth();
    
    jsonResponse([
        'success' => true,
        'user' => [
            'id' => (int)$user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'is_admin' => (bool)$user['is_admin'],
            'created_at' => $user['created_at']
        ]
    ]);
}

// ===================== ВЫХОД =====================
function handleLogout(): void {
    // JWT токены stateless, просто подтверждаем выход
    // Клиент должен удалить токен из localStorage
    jsonResponse([
        'success' => true,
        'message' => 'Выход выполнен'
    ]);
}
