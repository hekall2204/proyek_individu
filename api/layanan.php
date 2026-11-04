<?php
declare(strict_types=1);

require_once __DIR__ . '/../Database.php';

header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'];

try {
    // Menggunakan Singleton getInstance() sesuai struktur Database.php
    $db = Database::getInstance();

    switch ($method) {
        case 'GET':
            // 1. GET by ID (jika ada parameter ?id=...)
            if (isset($_GET['id'])) {
                $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
                $stmt = $db->prepare('SELECT * FROM layanan WHERE id = ?');
                $stmt->execute([$id]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$result) {
                    http_response_code(404);
                    echo json_encode(['error' => ['code' => 404, 'message' => 'Data layanan tidak ditemukan']], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                echo json_encode($result, JSON_UNESCAPED_UNICODE);
                exit;
            }

            // 2. GET Collection dengan Pencarian & Pagination
            $search = $_GET['search'] ?? '';
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = 5;
            $offset = ($page - 1) * $limit;

            $stmt = $db->prepare("SELECT * FROM layanan WHERE nama_layanan LIKE :search LIMIT :limit OFFSET :offset");
            $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
            break;

        case 'POST':
            // 3. CREATE Data Baru dengan Validasi & Prepared Statement
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            
            $nama = trim((string) ($input['nama_layanan'] ?? ''));
            $kategori = trim((string) ($input['kategori'] ?? 'Umum'));
            $harga = filter_var($input['harga'] ?? null, FILTER_VALIDATE_FLOAT);
            $deskripsi = trim((string) ($input['deskripsi'] ?? ''));

            if ($nama === '' || strlen($nama) > 100 || $harga === false || $harga < 0) {
                http_response_code(422);
                echo json_encode(['error' => ['code' => 422, 'message' => 'Data input tidak valid atau melebihi batas']], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $db->prepare('INSERT INTO layanan (nama_layanan, kategori, harga, deskripsi) VALUES (:nama, :kategori, :harga, :deskripsi)');
            $stmt->execute(compact('nama', 'kategori', 'harga', 'deskripsi'));

            http_response_code(201);
            echo json_encode([
                'id' => (int) $db->lastInsertId(),
                'message' => 'Data layanan berhasil ditambahkan',
                'data' => compact('nama', 'kategori', 'harga', 'deskripsi')
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'PUT':
        case 'PATCH':
            // 4. UPDATE Data dengan Existence Check
            $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => ['code' => 400, 'message' => 'ID tidak valid']], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $check = $db->prepare('SELECT id FROM layanan WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => ['code' => 404, 'message' => 'Data layanan tidak ditemukan']], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $nama = trim((string) ($input['nama_layanan'] ?? ''));
            $kategori = trim((string) ($input['kategori'] ?? 'Umum'));
            $harga = filter_var($input['harga'] ?? null, FILTER_VALIDATE_FLOAT);
            $deskripsi = trim((string) ($input['deskripsi'] ?? ''));

            if ($nama === '' || strlen($nama) > 100 || $harga === false || $harga < 0) {
                http_response_code(422);
                echo json_encode(['error' => ['code' => 422, 'message' => 'Data pembaruan tidak valid']], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $db->prepare('UPDATE layanan SET nama_layanan = :nama, kategori = :kategori, harga = :harga, deskripsi = :deskripsi WHERE id = :id');
            $stmt->execute(compact('nama', 'kategori', 'harga', 'deskripsi', 'id'));

            echo json_encode(['message' => 'Data layanan berhasil diperbarui'], JSON_UNESCAPED_UNICODE);
            break;

        case 'DELETE':
            // 5. DELETE Data dengan Existence Check
            $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => ['code' => 400, 'message' => 'ID tidak valid']], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $check = $db->prepare('SELECT id FROM layanan WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => ['code' => 404, 'message' => 'Data layanan tidak ditemukan']], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $db->prepare('DELETE FROM layanan WHERE id = ?');
            $stmt->execute([$id]);

            http_response_code(204); // No Content
            break;

        default:
            header('Allow: GET, POST, PUT, PATCH, DELETE');
            http_response_code(405);
            echo json_encode(['error' => ['code' => 405, 'message' => 'Method tidak diizinkan']], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    // Response error generik 500 yang aman
    http_response_code(500);
    echo json_encode(['error' => ['code' => 500, 'message' => 'Terjadi kesalahan pada server']], JSON_UNESCAPED_UNICODE);
}