<?php

// Kunci server Midtrans
define('MIDTRANS_SERVER_KEY', 'Mid-server-PiZ7IfOU1YRkp7mc90IOGB0z');

// Fungsi untuk verifikasi tanda tangan
function verifySignature($data)
{
    $expectedSignature = hash('sha512', $data['order_id'] . $data['status_code'] . $data['gross_amount'] . MIDTRANS_SERVER_KEY);
    return $data['signature_key'] === $expectedSignature;
}

// Tambahkan fungsi untuk memperbarui saldo pengguna
function addBalance($userId, $amount)
{
    // Simulasi database pengguna
    $userFile = 'users.json';
    $users = file_exists($userFile) ? json_decode(file_get_contents($userFile), true) : [];

    if (!isset($users[$userId])) {
        $users[$userId] = ['balance' => 0];
    }

    $users[$userId]['balance'] += $amount;

    file_put_contents($userFile, json_encode($users));
}

// Menangani callback
$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

// Periksa apakah tanda tangan valid
if (verifySignature($data)) {
    $orderId = $data['order_id'];
    $transactionStatus = $data['transaction_status'];
    $grossAmount = $data['gross_amount'];

    // Ekstrak userId dari order_id (format: DEPO-userId-timestamp)
    $userId = explode('-', $orderId)[1];

    if ($transactionStatus === 'settlement') {
        // Tambahkan saldo pengguna
        addBalance($userId, (int) $grossAmount);

        http_response_code(200);
        echo "✅ Deposit berhasil. Saldo pengguna telah diperbarui.";
    } elseif ($transactionStatus === 'expire' || $transactionStatus === 'cancel') {
        http_response_code(200);
        echo "❌ Deposit gagal atau kedaluwarsa.";
    } else {
        http_response_code(200);
        echo "⚠️ Status transaksi: $transactionStatus.";
    }
} else {
    http_response_code(403);
    echo "❌ Tanda tangan tidak valid.";
}
