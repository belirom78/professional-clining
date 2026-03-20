<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

const TELEGRAM_BOT_TOKEN = '8682964443:AAGIbbgSdASqrv1efWH48vrLkpKOObDZmkk';
const TELEGRAM_CHAT_ID = '311666698';
const SITE_EMAIL = 'kirill.beliaew2013@gmail.com';

function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function postValue(string $key): string
{
    return trim((string)($_POST[$key] ?? ''));
}

function isConfigured(string $value): bool
{
    return $value !== '' && !str_starts_with($value, 'PASTE_');
}

function telegramRequest(string $message): bool
{
    if (!isConfigured(TELEGRAM_BOT_TOKEN) || !isConfigured(TELEGRAM_CHAT_ID)) {
        return false;
    }

    $url = 'https://api.telegram.org/bot' . TELEGRAM_BOT_TOKEN . '/sendMessage';
    $payload = http_build_query([
        'chat_id' => TELEGRAM_CHAT_ID,
        'text' => $message,
    ]);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $response = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $response !== false && $httpCode >= 200 && $httpCode < 300;
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $payload,
            'timeout' => 10,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);

    return $response !== false;
}

function encodeMailSubject(string $subject): string
{
    if (function_exists('mb_encode_mimeheader')) {
        return mb_encode_mimeheader($subject, 'UTF-8');
    }

    return '=?UTF-8?B?' . base64_encode($subject) . '?=';
}

function sendEmailMessage(string $subject, string $message): bool
{
    if (!isConfigured(SITE_EMAIL)) {
        return false;
    }

    $serverName = $_SERVER['HTTP_HOST'] ?? 'belclean.local';
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'From: BelClean <no-reply@' . $serverName . '>',
    ];

    return mail(
        SITE_EMAIL,
        encodeMailSubject($subject),
        $message,
        implode("\r\n", $headers)
    );
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(405, [
        'success' => false,
        'message' => 'Метод запроса не поддерживается.',
    ]);
}

$name = postValue('name');
$phone = postValue('phone');
$source = postValue('source');
$page = postValue('page');
$formType = postValue('form_type');
$address = postValue('address');
$roomType = postValue('room_type');
$preferredDate = postValue('preferred_date');
$preferredTime = postValue('preferred_time');
$callbackRequested = postValue('callback_requested');
$comment = postValue('comment');
$area = postValue('area');
$cleaningType = postValue('cleaning_type');
$options = postValue('options');
$total = postValue('total');
$honeypot = postValue('website');

$isHeroLead = $source === 'hero' || $formType === 'hero_lead';

if ($honeypot !== '') {
    respond(422, [
        'success' => false,
        'message' => 'Не удалось отправить заявку. Проверьте данные и попробуйте снова.',
    ]);
}

if ($name === '') {
    respond(422, [
        'success' => false,
        'message' => 'Укажите имя.',
    ]);
}

if ($phone === '') {
    respond(422, [
        'success' => false,
        'message' => 'Укажите телефон.',
    ]);
}

$phoneDigits = preg_replace('/\D+/', '', $phone) ?? '';
if ($phoneDigits !== '' && $phoneDigits[0] === '8') {
    $phoneDigits = '7' . substr($phoneDigits, 1);
}

if (strlen($phoneDigits) !== 11) {
    respond(422, [
        'success' => false,
        'message' => 'Введите телефон полностью.',
    ]);
}

$callbackYes = $callbackRequested === 'yes' || $callbackRequested === '1';
$roomType = $roomType !== '' ? $roomType : 'Квартира';

if (!$isHeroLead) {
    if ($preferredDate === '') {
        respond(422, [
            'success' => false,
            'message' => 'Укажите дату уборки.',
        ]);
    }

    if ($preferredTime === '') {
        respond(422, [
            'success' => false,
            'message' => 'Укажите удобное время.',
        ]);
    }

    $selectedDate = strtotime($preferredDate . ' 00:00:00');
    $todayDate = strtotime(date('Y-m-d') . ' 00:00:00');

    if ($selectedDate === false || $selectedDate < $todayDate) {
        respond(422, [
            'success' => false,
            'message' => 'Дата уборки не может быть в прошлом.',
        ]);
    }

    if ($total === '' || !is_numeric($total) || (float)$total <= 0) {
        respond(422, [
            'success' => false,
            'message' => 'Сначала выполните корректный расчёт стоимости.',
        ]);
    }

    $messageLines = [
        '🧹 Новая заявка с сайта BelClean',
        '',
        'Имя: ' . $name,
        'Телефон: ' . $phone,
        'Тип помещения: ' . $roomType,
        'Адрес: ' . ($address !== '' ? $address : 'Не указан'),
        'Дата уборки: ' . $preferredDate,
        'Удобное время: ' . $preferredTime,
        'Обратный звонок: ' . ($callbackYes ? 'Да' : 'Нет'),
        'Тип уборки: ' . ($cleaningType !== '' ? $cleaningType : 'Не указан'),
        'Площадь: ' . ($area !== '' ? $area . ' м²' : 'Не указана'),
        'Опции: ' . ($options !== '' ? $options : 'Без доп. опций'),
        'Итог: ' . number_format((float)$total, 0, '.', ' ') . ' ₽',
        'Комментарий: ' . ($comment !== '' ? $comment : 'Нет'),
    ];

    $subject = 'Новая заявка с сайта BelClean';
} else {
    $messageLines = [
        '⚡ Новая быстрая заявка с сайта BelClean',
        '',
        'Источник: Hero',
        'Имя: ' . $name,
        'Телефон: ' . $phone,
        'Обратный звонок: ' . ($callbackYes ? 'Да' : 'Нет'),
    ];

    $subject = 'Быстрая заявка с сайта BelClean';
}

$message = implode("\n", $messageLines);

$telegramSent = telegramRequest($message);
$emailSent = sendEmailMessage($subject, $message);

if (!$telegramSent && !$emailSent) {
    respond(500, [
        'success' => false,
        'message' => 'Заявка не отправлена. Проверьте настройки send.php: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID и SITE_EMAIL.',
    ]);
}

respond(200, [
    'success' => true,
    'message' => $isHeroLead
        ? 'Заявка отправлена. Скоро свяжемся.'
        : 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.',
]);
