<?php
/**
 * API сохранений игры
 */
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        handleList();
        break;
    case 'save':
        handleSave();
        break;
    case 'load':
        handleLoad();
        break;
    case 'delete':
        handleDelete();
        break;
    default:
        jsonError('Unknown action', 404);
}

// ===================== СПИСОК СОХРАНЕНИЙ =====================
function handleList(): void {
    $user = requireAuth();
    $db = getDB();
    
    $stmt = $db->prepare("
        SELECT id, save_name, player_level, player_balance, buildings_count, play_time, created_at, updated_at 
        FROM game_saves 
        WHERE user_id = ? 
        ORDER BY updated_at DESC
    ");
    $stmt->execute([$user['id']]);
    $saves = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'saves' => $saves
    ]);
}

// ===================== СОХРАНЕНИЕ =====================
function handleSave(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed', 405);
    }
    
    $user = requireAuth();
    $input = getJsonInput();
    
    $saveData = $input['save_data'] ?? null;
    $saveName = trim($input['save_name'] ?? 'Автосохранение');
    $saveId = $input['save_id'] ?? null; // Для обновления существующего
    
    if (!$saveData) {
        jsonError('Нет данных для сохранения');
    }
    
    // Извлекаем метаданные из сохранения
    $playerLevel = 1;
    $playerBalance = 0;
    $buildingsCount = 0;
    $playTime = 0;
    
    if (is_array($saveData)) {
        $playerLevel = $saveData['player']['level'] ?? 1;
        $playerBalance = $saveData['player']['balance'] ?? 0;
        $buildingsCount = count($saveData['world']['buildings'] ?? []);
        $playTime = $saveData['world']['tick'] ?? 0;
        $saveData = json_encode($saveData, JSON_UNESCAPED_UNICODE);
    }
    
    $db = getDB();
    
    if ($saveId) {
        // Обновляем существующее сохранение
        $stmt = $db->prepare("
            UPDATE game_saves 
            SET save_name = ?, save_data = ?, player_level = ?, player_balance = ?, buildings_count = ?, play_time = ?
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$saveName, $saveData, $playerLevel, $playerBalance, $buildingsCount, $playTime, $saveId, $user['id']]);
        
        if ($stmt->rowCount() === 0) {
            jsonError('Сохранение не найдено');
        }
        
        $resultId = $saveId;
    } else {
        // Создаем новое сохранение
        $stmt = $db->prepare("
            INSERT INTO game_saves (user_id, save_name, save_data, player_level, player_balance, buildings_count, play_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$user['id'], $saveName, $saveData, $playerLevel, $playerBalance, $buildingsCount, $playTime]);
        $resultId = $db->lastInsertId();
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Игра сохранена',
        'save_id' => (int)$resultId
    ]);
}

// ===================== ЗАГРУЗКА =====================
function handleLoad(): void {
    $user = requireAuth();
    $saveId = $_GET['id'] ?? null;
    
    if (!$saveId) {
        jsonError('Не указан ID сохранения');
    }
    
    $db = getDB();
    
    $stmt = $db->prepare("SELECT * FROM game_saves WHERE id = ? AND user_id = ?");
    $stmt->execute([$saveId, $user['id']]);
    $save = $stmt->fetch();
    
    if (!$save) {
        jsonError('Сохранение не найдено', 404);
    }
    
    jsonResponse([
        'success' => true,
        'save' => [
            'id' => (int)$save['id'],
            'save_name' => $save['save_name'],
            'save_data' => json_decode($save['save_data'], true),
            'created_at' => $save['created_at'],
            'updated_at' => $save['updated_at']
        ]
    ]);
}

// ===================== УДАЛЕНИЕ =====================
function handleDelete(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        jsonError('Method not allowed', 405);
    }
    
    $user = requireAuth();
    $input = getJsonInput();
    $saveId = $input['save_id'] ?? $_GET['id'] ?? null;
    
    if (!$saveId) {
        jsonError('Не указан ID сохранения');
    }
    
    $db = getDB();
    
    $stmt = $db->prepare("DELETE FROM game_saves WHERE id = ? AND user_id = ?");
    $stmt->execute([$saveId, $user['id']]);
    
    if ($stmt->rowCount() === 0) {
        jsonError('Сохранение не найдено', 404);
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Сохранение удалено'
    ]);
}
