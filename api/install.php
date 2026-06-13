<?php
/**
 * Скрипт установки базы данных
 * 
 * ИНСТРУКЦИЯ:
 * 1. Настройте config.php с правильными данными БД
 * 2. Откройте этот файл в браузере: http://localhost/api/install.php
 * 3. После успешной установки удалите или защитите этот файл!
 */

// Сначала подключимся без указания базы данных для её создания
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'factory_game';

try {
    // Подключение для создания БД
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    
    // Создаем базу данных если не существует
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$dbname`");
    
    echo "<h2>✅ База данных '$dbname' создана/существует</h2>";
    
    // ===================== ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ =====================
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `users` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `username` VARCHAR(50) NOT NULL UNIQUE,
            `email` VARCHAR(100) NOT NULL UNIQUE,
            `password_hash` VARCHAR(255) NOT NULL,
            `is_admin` TINYINT(1) DEFAULT 0,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX `idx_username` (`username`),
            INDEX `idx_email` (`email`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<p>✅ Таблица 'users' создана</p>";
    
    // ===================== ТАБЛИЦА СОХРАНЕНИЙ =====================
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `game_saves` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED NOT NULL,
            `save_name` VARCHAR(100) DEFAULT 'Автосохранение',
            `save_data` LONGTEXT NOT NULL,
            `player_level` INT DEFAULT 1,
            `player_balance` BIGINT DEFAULT 0,
            `buildings_count` INT DEFAULT 0,
            `play_time` INT DEFAULT 0,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
            INDEX `idx_user_id` (`user_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<p>✅ Таблица 'game_saves' создана</p>";
    
    // ===================== ТАБЛИЦА НАСТРОЕК ИГРЫ (для админа) =====================
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `game_settings` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `setting_key` VARCHAR(100) NOT NULL UNIQUE,
            `setting_value` TEXT NOT NULL,
            `setting_type` ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
            `description` VARCHAR(255),
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<p>✅ Таблица 'game_settings' создана</p>";
    
    // ===================== ТАБЛИЦА ЗДАНИЙ (для админа) =====================
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `building_definitions` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `type` VARCHAR(50) NOT NULL UNIQUE,
            `name_ru` VARCHAR(100) NOT NULL,
            `name_en` VARCHAR(100) NOT NULL,
            `icon` VARCHAR(10),
            `base_cost` INT UNSIGNED DEFAULT 1000,
            `footprint_w` TINYINT UNSIGNED DEFAULT 1,
            `footprint_h` TINYINT UNSIGNED DEFAULT 1,
            `tier` TINYINT UNSIGNED DEFAULT 1,
            `unlock_level` TINYINT UNSIGNED DEFAULT 1,
            `power_output` INT DEFAULT 0,
            `power_need` INT DEFAULT 0,
            `water_need` INT DEFAULT 0,
            `waste_output` INT DEFAULT 0,
            `maintenance` INT DEFAULT 0,
            `base_exp_build` INT DEFAULT 10,
            `production_rate` DECIMAL(10,2) DEFAULT 0,
            `production_value` INT DEFAULT 0,
            `color` VARCHAR(20) DEFAULT '#888888',
            `height` DECIMAL(5,2) DEFAULT 1.0,
            `description_ru` TEXT,
            `description_en` TEXT,
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<p>✅ Таблица 'building_definitions' создана</p>";
    
    // ===================== ТАБЛИЦА ЛОГОВ АДМИНА =====================
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `admin_logs` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `admin_id` INT UNSIGNED NOT NULL,
            `action` VARCHAR(100) NOT NULL,
            `target_type` VARCHAR(50),
            `target_id` INT UNSIGNED,
            `details` TEXT,
            `ip_address` VARCHAR(45),
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
            INDEX `idx_admin_id` (`admin_id`),
            INDEX `idx_created_at` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<p>✅ Таблица 'admin_logs' создана</p>";
    
    // ===================== СОЗДАЕМ АДМИНА ПО УМОЛЧАНИЮ =====================
    $adminUsername = 'admin';
    $adminEmail = 'admin@factory.game';
    $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$adminUsername]);
    
    if (!$stmt->fetch()) {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, 1)");
        $stmt->execute([$adminUsername, $adminEmail, $adminPassword]);
        echo "<p>✅ Админ создан: <strong>admin</strong> / <strong>admin123</strong></p>";
    } else {
        echo "<p>ℹ️ Админ уже существует</p>";
    }
    
    // ===================== ДОБАВЛЯЕМ НАСТРОЙКИ ПО УМОЛЧАНИЮ =====================
    $defaultSettings = [
        ['starting_balance', '25000', 'number', 'Начальный баланс игрока'],
        ['exp_multiplier', '1.0', 'number', 'Множитель опыта'],
        ['cost_multiplier', '1.0', 'number', 'Множитель стоимости зданий'],
        ['maintenance_multiplier', '1.0', 'number', 'Множитель расходов на обслуживание'],
        ['breakdown_chance', '0.001', 'number', 'Базовый шанс поломки'],
        ['max_level', '50', 'number', 'Максимальный уровень игрока'],
        ['enable_events', 'true', 'boolean', 'Включить случайные события'],
        ['market_volatility', '0.12', 'number', 'Волатильность рынка'],
    ];
    
    $stmt = $pdo->prepare("INSERT IGNORE INTO game_settings (setting_key, setting_value, setting_type, description) VALUES (?, ?, ?, ?)");
    foreach ($defaultSettings as $setting) {
        $stmt->execute($setting);
    }
    echo "<p>✅ Настройки по умолчанию добавлены</p>";
    
    echo "<hr>";
    echo "<h2>🎉 Установка завершена!</h2>";
    echo "<p><strong>Важно:</strong> Удалите или защитите этот файл (install.php) в продакшене!</p>";
    echo "<p>Данные для входа в админ-панель:</p>";
    echo "<ul>";
    echo "<li>Логин: <code>admin</code></li>";
    echo "<li>Пароль: <code>admin123</code></li>";
    echo "</ul>";
    echo "<p><a href='../'>← Вернуться к игре</a></p>";
    
} catch (PDOException $e) {
    echo "<h2>❌ Ошибка установки</h2>";
    echo "<p style='color:red;'>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<h3>Возможные решения:</h3>";
    echo "<ul>";
    echo "<li>Убедитесь, что MySQL сервер запущен</li>";
    echo "<li>Проверьте логин/пароль в config.php</li>";
    echo "<li>Убедитесь, что у пользователя есть права на создание БД</li>";
    echo "</ul>";
}
