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

$pdo = Database::getInstance();
$input    = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

$stmt = $pdo->prepare('SELECT id, nama, email, password_hash, role FROM users WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Email atau password salah']);
    exit;
}

Auth::startSession();
session_regenerate_id(true);

$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['nama']    = $user['nama'];
$_SESSION['role']    = $user['role'];

echo json_encode([
    'message' => 'Login berhasil',
    'user'    => ['id' => $_SESSION['user_id'], 'nama' => $_SESSION['nama'], 'role' => $_SESSION['role']]
]);