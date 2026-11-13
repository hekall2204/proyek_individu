<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../Database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$pdo = Database::getInstance();
$input    = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$nama     = trim($input['nama'] ?? '');
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$role     = in_array($input['role'] ?? '', ['admin', 'petugas', 'pelanggan'], true) ? $input['role'] : 'pelanggan';

if ($nama === '' || $email === '' || strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Nama dan email wajib diisi, password minimal 6 karakter.']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare('INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)');
    $stmt->execute([$nama, $email, $hash, $role]);

    http_response_code(201);
    echo json_encode(['message' => 'Registrasi berhasil', 'role' => $role]);
} catch (PDOException $e) {
    http_response_code(409);
    echo json_encode(['error' => 'Email sudah terdaftar.']);
}