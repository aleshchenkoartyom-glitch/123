<?php
/**
 * API админ-панели
 */
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

// Все действия требуют прав админа
$admin = requireAdmin();

switch ($action) {
    // Пользователи
    case 'users':
        handleUsers();
        break;
    case 'user':
        handleUser();
        break;
    case 'user_update':
        handleUserUpdate();
        break;
    case 'user_delete':
        handleUserDelete();
        break;
    
    // Настройки игры
    case 'settings':
        handleSettings();
        break;
    case 'setting_update':
        handleSettingUpdate();
        break;
    
    // Здания
    case 'buildings':
        handleBuildings();
        break;
    case 'building_update':
        handleBuildingUpdate();
        break;
    
    // Сохранения (всех пользователей)
    case 'all_saves':
        handleAllSaves();
        break;
    
    // Статистика
    case 'stats':
        handleStats();
        break;
    
    // Логи
    case 'logs':
        handleLogs();
        break;
    
    default:
        jsonError('Unknown admin action', 404);
}

// ===================== ЛОГИРОВАНИЕ =====================
function logAdminAction(int $adminId, string $action, ?string $targetType = null, ?int $targetId = null, ?string $details = null): void {
    $db = getDB();
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    $stmt = $db->prepare("INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$adminId, $action, $targetType, $targetId, $details, $ip]);
}

// ===================== ПОЛЬЗОВАТЕЛИ =====================
function handleUsers(): void {
    $db = getDB();
    
    $search = $_GET['search'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = 20;
    $offset = ($page - 1) * $perPage;
    
    $where = '';
    $params = [];
    
    if ($search) {
        $where = "WHERE username LIKE ? OR email LIKE ?";
        $params = ["%$search%", "%$search%"];
    }
    
    // Получаем общее количество
    $countStmt = $db->prepare("SELECT COUNT(*) FROM users $where");
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();
    
    // Получаем пользователей
    $stmt = $db->prepare("
        SELECT u.id, u.username, u.email, u.is_admin, u.created_at,
               (SELECT COUNT(*) FROM game_saves WHERE user_id = u.id) as saves_count,
               (SELECT MAX(player_level) FROM game_saves WHERE user_id = u.id) as max_level
        FROM users u
        $where
        ORDER BY u.created_at DESC
        LIMIT $perPage OFFSET $offset
    ");
    $stmt->execute($params);
    $users = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'users' => $users,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'per_page' => $perPage,
            'pages' => ceil($total / $perPage)
        ]
    ]);
}

function handleUser(): void {
    $userId = $_GET['id'] ?? null;
    if (!$userId) jsonError('User ID required');
    
    $db = getDB();
    
    $stmt = $db->prepare("
        SELECT u.id, u.username, u.email, u.is_admin, u.created_at, u.updated_at
        FROM users u WHERE u.id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) jsonError('User not found', 404);
    
    // Получаем сохранения пользователя
    $stmt = $db->prepare("SELECT id, save_name, player_level, player_balance, buildings_count, updated_at FROM game_saves WHERE user_id = ? ORDER BY updated_at DESC");
    $stmt->execute([$userId]);
    $saves = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'user' => $user,
        'saves' => $saves
    ]);
}

function handleUserUpdate(): void {
    global $admin;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);
    
    $input = getJsonInput();
    $userId = $input['user_id'] ?? null;
    
    if (!$userId) jsonError('User ID required');
    
    $db = getDB();
    
    $updates = [];
    $params = [];
    
    if (isset($input['username'])) {
        $updates[] = "username = ?";
        $params[] = $input['username'];
    }
    
    if (isset($input['email'])) {
        $updates[] = "email = ?";
        $params[] = $input['email'];
    }
    
    if (isset($input['is_admin'])) {
        $updates[] = "is_admin = ?";
        $params[] = $input['is_admin'] ? 1 : 0;
    }
    
    if (isset($input['password']) && !empty($input['password'])) {
        $updates[] = "password_hash = ?";
        $params[] = password_hash($input['password'], PASSWORD_DEFAULT);
    }
    
    if (empty($updates)) {
        jsonError('Nothing to update');
    }
    
    $params[] = $userId;
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    logAdminAction($admin['id'], 'user_update', 'user', $userId, json_encode($input));
    
    jsonResponse(['success' => true, 'message' => 'Пользователь обновлён']);
}

function handleUserDelete(): void {
    global $admin;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        jsonError('Method not allowed', 405);
    }
    
    $input = getJsonInput();
    $userId = $input['user_id'] ?? $_GET['id'] ?? null;
    
    if (!$userId) jsonError('User ID required');
    if ($userId == $admin['id']) jsonError('Cannot delete yourself');
    
    $db = getDB();
    
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    
    logAdminAction($admin['id'], 'user_delete', 'user', $userId);
    
    jsonResponse(['success' => true, 'message' => 'Пользователь удалён']);
}

// ===================== НАСТРОЙКИ ИГРЫ =====================
function handleSettings(): void {
    $db = getDB();
    
    $stmt = $db->query("SELECT * FROM game_settings ORDER BY setting_key");
    $settings = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'settings' => $settings
    ]);
}

function handleSettingUpdate(): void {
    global $admin;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);
    
    $input = getJsonInput();
    $key = $input['key'] ?? null;
    $value = $input['value'] ?? null;
    
    if (!$key) jsonError('Setting key required');
    
    $db = getDB();
    
    $stmt = $db->prepare("UPDATE game_settings SET setting_value = ? WHERE setting_key = ?");
    $stmt->execute([$value, $key]);
    
    if ($stmt->rowCount() === 0) {
        // Создаём новую настройку
        $stmt = $db->prepare("INSERT INTO game_settings (setting_key, setting_value, setting_type, description) VALUES (?, ?, 'string', '')");
        $stmt->execute([$key, $value]);
    }
    
    logAdminAction($admin['id'], 'setting_update', 'setting', null, "$key = $value");
    
    jsonResponse(['success' => true, 'message' => 'Настройка обновлена']);
}

// ===================== ЗДАНИЯ =====================
function handleBuildings(): void {
    $db = getDB();
    
    $stmt = $db->query("SELECT * FROM building_definitions ORDER BY tier, unlock_level, type");
    $buildings = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'buildings' => $buildings
    ]);
}

function handleBuildingUpdate(): void {
    global $admin;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);
    
    $input = getJsonInput();
    $buildingId = $input['id'] ?? null;
    
    $db = getDB();
    
    // Подготавливаем данные
    $data = [
        'type' => $input['type'] ?? '',
        'name_ru' => $input['name_ru'] ?? '',
        'name_en' => $input['name_en'] ?? '',
        'icon' => $input['icon'] ?? '🏠',
        'base_cost' => (int)($input['base_cost'] ?? 1000),
        'footprint_w' => (int)($input['footprint_w'] ?? 1),
        'footprint_h' => (int)($input['footprint_h'] ?? 1),
        'tier' => (int)($input['tier'] ?? 1),
        'unlock_level' => (int)($input['unlock_level'] ?? 1),
        'power_output' => (int)($input['power_output'] ?? 0),
        'power_need' => (int)($input['power_need'] ?? 0),
        'water_need' => (int)($input['water_need'] ?? 0),
        'waste_output' => (int)($input['waste_output'] ?? 0),
        'maintenance' => (int)($input['maintenance'] ?? 0),
        'base_exp_build' => (int)($input['base_exp_build'] ?? 10),
        'production_rate' => (float)($input['production_rate'] ?? 0),
        'production_value' => (int)($input['production_value'] ?? 0),
        'color' => $input['color'] ?? '#888888',
        'height' => (float)($input['height'] ?? 1.0),
        'description_ru' => $input['description_ru'] ?? '',
        'description_en' => $input['description_en'] ?? '',
        'is_active' => isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : 1,
    ];
    
    if ($buildingId) {
        // Обновление
        $sql = "UPDATE building_definitions SET 
            type = :type, name_ru = :name_ru, name_en = :name_en, icon = :icon,
            base_cost = :base_cost, footprint_w = :footprint_w, footprint_h = :footprint_h,
            tier = :tier, unlock_level = :unlock_level, power_output = :power_output,
            power_need = :power_need, water_need = :water_need, waste_output = :waste_output,
            maintenance = :maintenance, base_exp_build = :base_exp_build,
            production_rate = :production_rate, production_value = :production_value,
            color = :color, height = :height, description_ru = :description_ru,
            description_en = :description_en, is_active = :is_active
            WHERE id = :id";
        $data['id'] = $buildingId;
        
        $stmt = $db->prepare($sql);
        $stmt->execute($data);
        
        logAdminAction($admin['id'], 'building_update', 'building', $buildingId);
    } else {
        // Создание
        $sql = "INSERT INTO building_definitions 
            (type, name_ru, name_en, icon, base_cost, footprint_w, footprint_h, tier, unlock_level,
             power_output, power_need, water_need, waste_output, maintenance, base_exp_build,
             production_rate, production_value, color, height, description_ru, description_en, is_active)
            VALUES 
            (:type, :name_ru, :name_en, :icon, :base_cost, :footprint_w, :footprint_h, :tier, :unlock_level,
             :power_output, :power_need, :water_need, :waste_output, :maintenance, :base_exp_build,
             :production_rate, :production_value, :color, :height, :description_ru, :description_en, :is_active)";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($data);
        $buildingId = $db->lastInsertId();
        
        logAdminAction($admin['id'], 'building_create', 'building', $buildingId);
    }
    
    jsonResponse(['success' => true, 'message' => 'Здание сохранено', 'id' => (int)$buildingId]);
}

// ===================== ВСЕ СОХРАНЕНИЯ =====================
function handleAllSaves(): void {
    $db = getDB();
    
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = 20;
    $offset = ($page - 1) * $perPage;
    
    $countStmt = $db->query("SELECT COUNT(*) FROM game_saves");
    $total = $countStmt->fetchColumn();
    
    $stmt = $db->prepare("
        SELECT gs.*, u.username 
        FROM game_saves gs 
        JOIN users u ON gs.user_id = u.id 
        ORDER BY gs.updated_at DESC 
        LIMIT $perPage OFFSET $offset
    ");
    $stmt->execute();
    $saves = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'saves' => $saves,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'per_page' => $perPage,
            'pages' => ceil($total / $perPage)
        ]
    ]);
}

// ===================== СТАТИСТИКА =====================
function handleStats(): void {
    $db = getDB();
    
    $stats = [];
    
    // Общая статистика
    $stats['total_users'] = (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $stats['total_saves'] = (int)$db->query("SELECT COUNT(*) FROM game_saves")->fetchColumn();
    $stats['total_buildings_types'] = (int)$db->query("SELECT COUNT(*) FROM building_definitions WHERE is_active = 1")->fetchColumn();
    
    // Активные пользователи (сохранялись за последние 7 дней)
    $stats['active_users_7d'] = (int)$db->query("SELECT COUNT(DISTINCT user_id) FROM game_saves WHERE updated_at > DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetchColumn();
    
    // Средний уровень
    $stats['avg_level'] = round((float)$db->query("SELECT AVG(player_level) FROM game_saves")->fetchColumn(), 1);
    
    // Топ игроков по уровню
    $stmt = $db->query("
        SELECT u.username, MAX(gs.player_level) as level, MAX(gs.player_balance) as balance
        FROM game_saves gs
        JOIN users u ON gs.user_id = u.id
        GROUP BY u.id
        ORDER BY level DESC, balance DESC
        LIMIT 10
    ");
    $stats['top_players'] = $stmt->fetchAll();
    
    // Регистрации за последние 30 дней
    $stmt = $db->query("
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date
    ");
    $stats['registrations_30d'] = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'stats' => $stats
    ]);
}

// ===================== ЛОГИ =====================
function handleLogs(): void {
    $db = getDB();
    
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = 50;
    $offset = ($page - 1) * $perPage;
    
    $stmt = $db->prepare("
        SELECT al.*, u.username as admin_username
        FROM admin_logs al
        JOIN users u ON al.admin_id = u.id
        ORDER BY al.created_at DESC
        LIMIT $perPage OFFSET $offset
    ");
    $stmt->execute();
    $logs = $stmt->fetchAll();
    
    $total = $db->query("SELECT COUNT(*) FROM admin_logs")->fetchColumn();
    
    jsonResponse([
        'success' => true,
        'logs' => $logs,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'per_page' => $perPage,
            'pages' => ceil($total / $perPage)
        ]
    ]);
}
