<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'];

// Handle GET Request (Mengambil data)
if ($method === 'GET') {
    http_response_code(200);
    echo json_encode([
        'data' => [
            ['id' => 1, 'nama' => 'Pemasangan Pagar', 'harga' => 1500000],
            ['id' => 2, 'nama' => 'Pemasangan Railing', 'harga' => 800000]
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Handle POST Request (Menambah data dengan validasi)
if ($method === 'POST') {
    try {
        $payload = json_decode(
            file_get_contents('php://input'),
            true,
            512,
            JSON_THROW_ON_ERROR
        );
    } catch (JsonException $e) {
        // Status 400: Format JSON Cacat/Rusak
        http_response_code(400);
        echo json_encode(['error' => 'Format JSON tidak valid']);
        exit;
    }

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['error' => 'Body JSON harus berupa object']);
        exit;
    }

    $nama = trim((string) ($payload['nama'] ?? ''));
    $harga = filter_var($payload['harga'] ?? null, FILTER_VALIDATE_INT);

    // Validasi Aturan Bisnis (Nama tidak boleh kosong, max 100 karakter, harga valid)
    if ($nama === '' || strlen($nama) > 100 || $harga === false || $harga < 0) {
        // Status 422: Unprocessable Content (Data gagal validasi aturan bisnis)
        http_response_code(422);
        echo json_encode(['error' => 'Data input tidak valid atau melebihi batas']);
        exit;
    }

    // Status 201: Data Berhasil Dibuat
    http_response_code(201);
    echo json_encode([
        'message' => 'Data layanan berhasil ditambahkan',
        'data' => compact('nama', 'harga')
    ]);
    exit;
}

// Handle Method Lain yang Belum Didukung (misal: DELETE)
header('Allow: GET, POST');
http_response_code(405); // Status 405: Method Not Allowed
echo json_encode(['error' => 'Method tidak diizinkan']);
exit;