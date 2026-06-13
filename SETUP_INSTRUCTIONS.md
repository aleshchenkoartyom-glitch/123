# 🏭 ЗАВОД — Инструкция по установке и настройке

## 📋 Содержание
1. [Требования](#требования)
2. [Быстрый старт (локальная разработка)](#быстрый-старт)
3. [Настройка базы данных](#настройка-базы-данных)
4. [Настройка PHP API](#настройка-php-api)
5. [Подключение фронтенда к API](#подключение-фронтенда)
6. [Деплой на продакшен](#деплой-на-продакшен)
7. [Структура базы данных](#структура-базы-данных)
8. [API Endpoints](#api-endpoints)
9. [Решение проблем](#решение-проблем)

---

## 📦 Требования

### Для фронтенда:
- Node.js 18+ 
- npm или yarn

### Для бэкенда:
- PHP 8.0+
- MySQL 5.7+ или MariaDB 10.3+
- Веб-сервер (Apache/Nginx) или встроенный PHP-сервер

### Рекомендуемые инструменты:
- **XAMPP** (Windows/Mac/Linux) — включает PHP, MySQL, Apache
- **MAMP** (Mac) — альтернатива XAMPP
- **Laragon** (Windows) — легковесная альтернатива
- **Docker** — для продвинутых пользователей

---

## 🚀 Быстрый старт

### Шаг 1: Установите XAMPP (или аналог)

1. Скачайте XAMPP: https://www.apachefriends.org/
2. Установите с компонентами: Apache, MySQL, PHP
3. Запустите **Apache** и **MySQL** через XAMPP Control Panel

### Шаг 2: Скопируйте файлы

```
Ваш проект/
├── api/                    ← PHP файлы (скопируйте в htdocs)
│   ├── config.php
│   ├── install.php
│   ├── auth.php
│   ├── saves.php
│   ├── admin.php
│   └── game.php
├── dist/                   ← Скомпилированный фронтенд
│   └── index.html
└── src/                    ← Исходный код (React)
```

**Для XAMPP:**
1. Скопируйте папку `api/` в `C:\xampp\htdocs\api\`
2. Скопируйте `dist/index.html` в `C:\xampp\htdocs\` (или в подпапку)

### Шаг 3: Настройте базу данных

1. Откройте браузер: http://localhost/phpmyadmin
2. Или сразу запустите установщик: http://localhost/api/install.php

### Шаг 4: Готово!

Откройте игру: http://localhost/

---

## 🗄️ Настройка базы данных

### Вариант 1: Автоматическая установка (рекомендуется)

1. Откройте `api/config.php` и проверьте настройки:

```php
define('DB_HOST', 'localhost');      // Обычно localhost
define('DB_NAME', 'factory_game');   // Имя БД (создастся автоматически)
define('DB_USER', 'root');           // Пользователь MySQL
define('DB_PASS', '');               // Пароль (пустой для XAMPP)
```

2. Откройте в браузере: `http://localhost/api/install.php`

3. Если всё успешно, вы увидите:
   - ✅ База данных создана
   - ✅ Таблицы созданы
   - ✅ Админ создан: **admin / admin123**

4. **ВАЖНО:** Удалите или переименуйте `install.php` после установки!

### Вариант 2: Ручная установка

1. Откройте phpMyAdmin: http://localhost/phpmyadmin
2. Создайте базу данных `factory_game`
3. Выполните SQL из `install.php` (скопируйте CREATE TABLE запросы)

---

## ⚙️ Настройка PHP API

### Файл config.php — главные настройки:

```php
// База данных
define('DB_HOST', 'localhost');
define('DB_NAME', 'factory_game');
define('DB_USER', 'root');
define('DB_PASS', 'your_password');  // Укажите пароль для продакшена!

// JWT секрет (ОБЯЗАТЕЛЬНО измените для продакшена!)
define('JWT_SECRET', 'your-super-secret-key-change-this-123!@#');
define('JWT_EXPIRY', 86400 * 7); // 7 дней
```

### CORS настройки (для разработки):

```php
header('Access-Control-Allow-Origin: *');  // Разрешить все домены
```

**Для продакшена** измените на ваш домен:
```php
header('Access-Control-Allow-Origin: https://yourdomain.com');
```

---

## 🔗 Подключение фронтенда к API

### Файл src/services/api.ts:

```typescript
// Измените на адрес вашего PHP сервера
const API_BASE_URL = '/api';

// Для разработки с разными портами:
// const API_BASE_URL = 'http://localhost/api';

// Для продакшена:
// const API_BASE_URL = 'https://api.yourdomain.com';
```

### Если фронтенд и API на разных доменах:

1. В `api/config.php` укажите домен фронтенда:
```php
header('Access-Control-Allow-Origin: http://localhost:5173');
```

2. В `src/services/api.ts` укажите полный URL API:
```typescript
const API_BASE_URL = 'http://localhost/api';
```

---

## 🌐 Деплой на продакшен

### Вариант 1: Один сервер (VPS/Shared Hosting)

1. **Загрузите файлы:**
```
/public_html/
├── api/
│   ├── config.php
│   ├── auth.php
│   ├── saves.php
│   ├── admin.php
│   └── game.php
├── index.html           ← dist/index.html
└── .htaccess            ← для маршрутизации
```

2. **Создайте .htaccess** (для Apache):
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/$1 [L]
RewriteRule ^(.*)$ index.html [L]
```

3. **Настройте config.php** с реальными данными БД

4. **Запустите install.php**, затем удалите его

### Вариант 2: Раздельный хостинг

**Фронтенд (Vercel/Netlify):**
- Загрузите `dist/` папку
- Укажите API_BASE_URL на ваш PHP сервер

**Бэкенд (VPS с PHP):**
- Загрузите `api/` папку
- Настройте CORS для домена фронтенда

---

## 📊 Структура базы данных

### Таблица `users`
| Поле | Тип | Описание |
|------|-----|----------|
| id | INT | Уникальный ID |
| username | VARCHAR(50) | Имя пользователя |
| email | VARCHAR(100) | Email |
| password_hash | VARCHAR(255) | Хеш пароля |
| is_admin | TINYINT | Админ (0/1) |
| created_at | DATETIME | Дата регистрации |

### Таблица `game_saves`
| Поле | Тип | Описание |
|------|-----|----------|
| id | INT | ID сохранения |
| user_id | INT | ID пользователя |
| save_name | VARCHAR(100) | Название |
| save_data | LONGTEXT | JSON данные игры |
| player_level | INT | Уровень игрока |
| player_balance | BIGINT | Баланс |
| buildings_count | INT | Количество зданий |
| play_time | INT | Время игры (тики) |

### Таблица `game_settings`
| Поле | Тип | Описание |
|------|-----|----------|
| setting_key | VARCHAR(100) | Ключ настройки |
| setting_value | TEXT | Значение |
| setting_type | ENUM | Тип (string/number/boolean/json) |
| description | VARCHAR(255) | Описание |

### Таблица `building_definitions`
Содержит определения всех зданий (редактируется в админ-панели)

### Таблица `admin_logs`
Логи действий администраторов

---

## 🔌 API Endpoints

### Авторизация (`/api/auth.php`)
| Метод | Action | Описание |
|-------|--------|----------|
| POST | `?action=register` | Регистрация |
| POST | `?action=login` | Вход |
| GET | `?action=me` | Текущий пользователь |
| GET | `?action=logout` | Выход |

### Сохранения (`/api/saves.php`)
| Метод | Action | Описание |
|-------|--------|----------|
| GET | `?action=list` | Список сохранений |
| POST | `?action=save` | Сохранить игру |
| GET | `?action=load&id=X` | Загрузить сохранение |
| POST | `?action=delete` | Удалить сохранение |

### Игра (`/api/game.php`)
| Метод | Action | Описание |
|-------|--------|----------|
| GET | `?action=settings` | Настройки игры |
| GET | `?action=buildings` | Определения зданий |
| GET | `?action=leaderboard` | Таблица лидеров |

### Админ (`/api/admin.php`) — требует права админа
| Метод | Action | Описание |
|-------|--------|----------|
| GET | `?action=stats` | Статистика |
| GET | `?action=users` | Список пользователей |
| POST | `?action=user_update` | Изменить пользователя |
| GET | `?action=settings` | Настройки игры |
| POST | `?action=setting_update` | Изменить настройку |
| GET | `?action=buildings` | Все здания |
| POST | `?action=building_update` | Изменить здание |
| GET | `?action=logs` | Логи действий |

---

## ❓ Решение проблем

### "CORS error" в консоли

**Причина:** Фронтенд и API на разных доменах/портах

**Решение:**
1. В `api/config.php`:
```php
header('Access-Control-Allow-Origin: http://localhost:5173');
// или для разработки: header('Access-Control-Allow-Origin: *');
```

### "Database connection failed"

**Причина:** Неверные данные подключения к MySQL

**Решение:**
1. Проверьте, запущен ли MySQL в XAMPP
2. Проверьте логин/пароль в `config.php`
3. Убедитесь, что база данных создана

### "401 Unauthorized"

**Причина:** Токен авторизации истёк или неверный

**Решение:**
1. Выйдите и войдите заново
2. Проверьте JWT_SECRET в config.php (должен быть одинаковым)

### Админ-панель не открывается

**Причина:** Пользователь не является админом

**Решение:**
1. Войдите как admin/admin123
2. Или в phpMyAdmin установите `is_admin = 1` для вашего пользователя

### Сохранения не работают

**Причина:** Не авторизован или ошибка API

**Решение:**
1. Авторизуйтесь в игре
2. Проверьте консоль браузера (F12) на ошибки
3. Проверьте что API доступен: http://localhost/api/auth.php?action=me

---

## 🔐 Безопасность (продакшен)

1. **Измените JWT_SECRET** на длинную случайную строку
2. **Установите сложный пароль MySQL**
3. **Удалите install.php** после установки
4. **Используйте HTTPS**
5. **Ограничьте CORS** конкретным доменом
6. **Регулярно делайте бэкапы** базы данных

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте консоль браузера (F12 → Console)
2. Проверьте логи PHP (в папке XAMPP/logs)
3. Проверьте сетевые запросы (F12 → Network)

---

**Удачной игры! 🏭**
