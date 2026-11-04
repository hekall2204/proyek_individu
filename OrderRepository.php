<?php

require_once __DIR__ . '/Database.php';

class OrderRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function createOrder(int $userId, string $kodeTrx, array $items, ?string $catatan): int {
        try {
            $this->db->beginTransaction();

            $totalEstimasi = 0;
            foreach ($items as $item) {
                $totalEstimasi += $item['subtotal'];
            }

            $stmtOrder = $this->db->prepare(
                "INSERT INTO orders (kode_trx, user_id, status, total_estimasi, catatan) 
                 VALUES (:kode_trx, :user_id, 'pengajuan', :total_estimasi, :catatan)"
            );
            $stmtOrder->execute([
                ':kode_trx'       => $kodeTrx,
                ':user_id'        => $userId,
                ':total_estimasi' => $totalEstimasi,
                ':catatan'        => $catatan
            ]);

            $orderId = (int)$this->db->lastInsertId();

            $stmtItem = $this->db->prepare(
                "INSERT INTO order_items (order_id, service_id, ukuran_m2, subtotal) 
                 VALUES (:order_id, :service_id, :ukuran_m2, :subtotal)"
            );

            foreach ($items as $item) {
                $stmtItem->execute([
                    ':order_id'   => $orderId,
                    ':service_id' => $item['service_id'],
                    ':ukuran_m2'  => $item['ukuran_m2'],
                    ':subtotal'   => $item['subtotal']
                ]);
            }

            $this->db->commit();
            return $orderId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getOrderStatusByCode(string $kodeTrx): ?array {
        $stmt = $this->db->prepare(
            "SELECT o.kode_trx, o.status, o.total_estimasi, o.created_at, u.nama, u.whatsapp 
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE o.kode_trx = :kode_trx"
        );
        $stmt->execute([':kode_trx' => $kodeTrx]);
        $result = $stmt->fetch();
        
        return $result ?: null;
    }
}