<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../Auth.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

Auth::startSession();
$max_attempts = 3;
$lockout_duration = 60;

if (isset($_SESSION['login_attempts']) && $_SESSION['login_attempts'] >= $max_attempts) {
    $time_passed = time() - ($_SESSION['last_attempt_time'] ?? 0);
    if ($time_passed < $lockout_duration) {
        $remaining = $lockout_duration - $time_passed;
        http_response_code(429);
        echo json_encode([
            "error" => "Too Many Requests: Terlalu banyak percobaan login gagal. Silakan coba lagi dalam {$remaining} detik."
        ]);
        exit;
    } else {
        $_SESSION['login_attempts'] = 0;
    }
}

$pdo = Database::getInstance();
$input    = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

$stmt = $pdo->prepare('SELECT id, nama, email, password_hash, role FROM users WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password_hash'])) {
    $_SESSION['login_attempts'] = ($_SESSION['login_attempts'] ?? 0) + 1;
    $_SESSION['last_attempt_time'] = time();

    http_response_code(401);
    echo json_encode(['error' => 'Email atau password salah']);
    exit;
}

$_SESSION['login_attempts'] = 0;
$_SESSION['last_attempt_time'] = time();

session_regenerate_id(true);

$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['nama']    = $user['nama'];
$_SESSION['role']    = $user['role'];

echo json_encode([
    'message' => 'Login berhasil',
    'user'    => ['id' => $_SESSION['user_id'], 'nama' => $_SESSION['nama'], 'role' => $_SESSION['role']]
]);