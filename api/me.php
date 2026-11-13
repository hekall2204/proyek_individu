<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../Auth.php';
header('Content-Type: application/json');

Auth::requireLogin();

$pdo = Database::getInstance();
$stmt = $pdo->prepare('SELECT id, nama, email, role, created_at FROM users WHERE id = :id');
$stmt->execute(['id' => $_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode(['data' => $user]);