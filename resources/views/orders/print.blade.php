<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nota - {{ $order->order_number }}</title>
    <style>
        @page {
            size: 80mm auto;
            margin: 0;
        }

        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin: 0;
            padding: 10px;
            width: 80mm;
        }

        .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }

        .header h1 {
            font-size: 18px;
            margin: 5px 0;
        }

        .header p {
            margin: 3px 0;
            font-size: 11px;
        }

        .info {
            margin-bottom: 10px;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
        }

        .items {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
            margin: 10px 0;
        }

        .item {
            margin: 5px 0;
        }

        .item-name {
            font-weight: bold;
        }

        .total {
            margin: 10px 0;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin: 5px 0;
        }

        .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #000;
        }

        .status {
            text-align: center;
            margin: 10px 0;
            padding: 5px;
            border: 1px solid #000;
        }

        @media print {
            body {
                padding: 0;
            }

            .no-print {
                display: none;
            }
        }
    </style>
</head>

<body>
    <div class="no-print" style="margin-bottom: 20px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">
            <i class="fas fa-print"></i> Print
        </button>
        <button onclick="window.close()"
            style="padding: 10px 20px; font-size: 14px; cursor: pointer; margin-left: 10px;">
            Tutup
        </button>
    </div>

    <div class="header">
        <h1>SIMJAHIT</h1>
        <p>Solusi Jahit Terpercaya</p>
        <p>Telp: {{ env('WA_PHONE_NUMBER', '08123456789') }}</p>
    </div>

    <div class="info">
        <div class="info-row">
            <span>No. Pesanan:</span>
            <span>{{ $order->order_number }}</span>
        </div>
        <div class="info-row">
            <span>Tanggal:</span>
            <span>{{ $order->order_date->format('d/m/Y') }}</span>
        </div>
        @if($order->deadline)
            <div class="info-row">
                <span>Deadline:</span>
                <span>{{ $order->deadline->format('d/m/Y') }}</span>
            </div>
        @endif
    </div>

    <div class="info">
        <strong>Pelanggan:</strong><br>
        {{ $order->customer->name }}<br>
        {{ $order->customer->phone }}<br>
        {{ $order->customer->address ?? '' }}
    </div>

    <div class="items">
        <strong>Detail Item:</strong>
        @foreach($order->orderItems as $item)
            <div class="item">
                <div class="item-name">{{ $item->item_name }}</div>
                <div>
                    {{ $item->quantity }} x Rp {{ number_format($item->price, 0, ',', '.') }}
                    = Rp {{ number_format($item->price * $item->quantity, 0, ',', '.') }}
                </div>
                @if($item->color || $item->size)
                    <div style="font-size: 10px; color: #666;">
                        @if($item->color) Warna: {{ $item->color }} @endif
                        @if($item->size) | Ukuran: {{ $item->size }} @endif
                    </div>
                @endif
            </div>
        @endforeach
    </div>

    <div class="total">
        <div class="total-row">
            <span>Total:</span>
            <span>Rp {{ number_format($order->total_amount, 0, ',', '.') }}</span>
        </div>
        <div class="total-row">
            <span>DP:</span>
            <span>Rp {{ number_format($order->down_payment, 0, ',', '.') }}</span>
        </div>
        <div class="total-row">
            <span>Sisa:</span>
            <span>Rp {{ number_format($order->remaining_payment, 0, ',', '.') }}</span>
        </div>
    </div>

    <div class="status">
        Status: {{ ucfirst($order->status) }}
    </div>

    @if($order->notes)
        <div style="margin-top: 10px; padding: 5px; border-top: 1px dashed #000;">
            <strong>Catatan:</strong><br>
            {{ $order->notes }}
        </div>
    @endif

    <div class="footer">
        <p>Terima kasih atas kepercayaan Anda!</p>
        <p style="font-size: 10px;">Dicetak: {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        // Auto print when page loads
        window.onload = function () {
            setTimeout(function () {
                window.print();
            }, 500);
        };
    </script>
</body>

</html>