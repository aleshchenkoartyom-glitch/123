<?php
/**
 * API игровых данных (публичное)
 */
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'settings':
        handlePublicSettings();
        break;
    case 'buildings':
        handlePublicBuildings();
        break;
    case 'leaderboard':
        handleLeaderboard();
        break;
    default:
        jsonError('Unknown action', 404);
}

// ===================== ПУБЛИЧНЫЕ НАСТРОЙКИ =====================
function handlePublicSettings(): void {
    $db = getDB();
    
    $stmt = $db->query("SELECT setting_key, setting_value, setting_type FROM game_settings");
    $rows = $stmt->fetchAll();
    
    $settings = [];
    foreach ($rows as $row) {
        $value = $row['setting_value'];
        
        switch ($row['setting_type']) {
            case 'number':
                $value = is_numeric($value) ? (float)$value : $value;
                break;
            case 'boolean':
                $value = $value === 'true' || $value === '1';
                break;
            case 'json':
                $value = json_decode($value, true);
                break;
        }
        
        $settings[$row['setting_key']] = $value;
    }
    
    jsonResponse([
        'success' => true,
        'settings' => $settings
    ]);
}

// ===================== ОПРЕДЕЛЕНИЯ ЗДАНИЙ =====================
function handlePublicBuildings(): void {
    $db = getDB();
    
    $stmt = $db->query("
        SELECT type, name_ru, name_en, icon, base_cost, footprint_w, footprint_h,
               tier, unlock_level, power_output, power_need, water_need, waste_output,
               maintenance, base_exp_build, production_rate, production_value,
               color, height, description_ru, description_en
        FROM building_definitions 
        WHERE is_active = 1 
        ORDER BY tier, unlock_level
    ");
    $buildings = $stmt->fetchAll();
    
    // Преобразуем в формат для игры
    $result = [];
    foreach ($buildings as $b) {
        $result[$b['type']] = [
            'type' => $b['type'],
            'name' => $b['name_ru'],
            'nameEn' => $b['name_en'],
            'icon' => $b['icon'],
            'baseCost' => (int)$b['base_cost'],
            'footprint' => ['w' => (int)$b['footprint_w'], 'h' => (int)$b['footprint_h']],
            'tier' => (int)$b['tier'],
            'unlockLevel' => (int)$b['unlock_level'],
            'powerOutput' => (int)$b['power_output'],
            'powerNeed' => (int)$b['power_need'],
            'waterNeed' => (int)$b['water_need'],
            'wasteOutput' => (int)$b['waste_output'],
            'maintenance' => (int)$b['maintenance'],
            'baseExpBuild' => (int)$b['base_exp_build'],
            'productionRate' => (float)$b['production_rate'],
            'productionValue' => (int)$b['production_value'],
            'color' => $b['color'],
            'height' => (float)$b['height'],
            'description' => $b['description_ru'],
            'descriptionEn' => $b['description_en'],
        ];
    }
    
    jsonResponse([
        'success' => true,
        'buildings' => $result
    ]);
}

// ===================== ТАБЛИЦА ЛИДЕРОВ =====================
function handleLeaderboard(): void {
    $db = getDB();
    
    $type = $_GET['type'] ?? 'level'; // level, balance, buildings
    $limit = min(100, max(10, (int)($_GET['limit'] ?? 20)));
    
    $orderBy = match($type) {
        'balance' => 'gs.player_balance DESC',
        'buildings' => 'gs.buildings_count DESC',
        default => 'gs.player_level DESC, gs.player_balance DESC'
    };
    
    $stmt = $db->prepare("
        SELECT 
            u.username,
            MAX(gs.player_level) as level,
            MAX(gs.player_balance) as balance,
            MAX(gs.buildings_count) as buildings,
            MAX(gs.play_time) as play_time
        FROM game_saves gs
        JOIN users u ON gs.user_id = u.id
        GROUP BY u.id
        ORDER BY $orderBy
        LIMIT $limit
    ");
    $stmt->execute();
    $leaderboard = $stmt->fetchAll();
    
    // Добавляем позиции
    foreach ($leaderboard as $i => &$row) {
        $row['position'] = $i + 1;
    }
    
    jsonResponse([
        'success' => true,
        'type' => $type,
        'leaderboard' => $leaderboard
    ]);
}
