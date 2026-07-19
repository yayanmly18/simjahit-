<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ThermalPrinterService
{
    protected $printerName;
    protected $printerWidth;

    public function __construct()
    {
        $this->printerName = env('PRINTER_NAME', 'thermal_printer');
        $this->printerWidth = env('PRINTER_WIDTH', 80);
    }

    /**
     * Print order receipt to thermal printer
     */
    public function printOrderReceipt($order)
    {
        $content = $this->generateReceiptContent($order);
        
        // Method 1: Using escpos-php library (recommended)
        return $this->printWithEscpos($content);
        
        // Method 2: Using system printer command
        // return $this->printWithSystemCommand($content);
    }

    /**
     * Generate receipt content in ESC/POS format
     */
    private function generateReceiptContent($order)
    {
        $lines = [];
        
        // Header
        $lines[] = $this->centerText('A.Y.A Tailor');
        $lines[] = $this->centerText('Solusi Jahit Terpercaya');
        $lines[] = $this->centerText('Telp: ' . env('WA_PHONE_NUMBER', '08123456789'));
        $lines[] = str_repeat('-', $this->printerWidth);
        
        // Order Info
        $lines[] = 'No. Pesanan: ' . $order->order_number;
        $lines[] = 'Tanggal: ' . $order->order_date->format('d/m/Y');
        if ($order->deadline) {
            $lines[] = 'Deadline: ' . $order->deadline->format('d/m/Y');
        }
        $lines[] = '';
        
        // Customer Info
        $lines[] = 'Pelanggan:';
        $lines[] = $order->customer->name;
        $lines[] = $order->customer->phone;
        if ($order->customer->address) {
            $lines[] = $order->customer->address;
        }
        $lines[] = '';
        
        // Items
        $lines[] = str_repeat('-', $this->printerWidth);
        $lines[] = $this->formatLine('Item', 'Qty', 'Harga', 'Subtotal');
        $lines[] = str_repeat('-', $this->printerWidth);
        
        foreach ($order->orderItems as $item) {
            $itemName = $this->truncateText($item->item_name, 20);
            $qty = str_pad($item->quantity, 3, ' ', STR_PAD_LEFT);
            $price = $this->formatCurrency($item->price);
            $subtotal = $this->formatCurrency($item->price * $item->quantity);
            
            $lines[] = $itemName;
            $lines[] = $this->formatLine('  ' . $qty . 'x', $price, $subtotal);
        }
        
        $lines[] = str_repeat('-', $this->printerWidth);
        $lines[] = '';
        
        // Totals
        $lines[] = $this->formatLine('Total:', $this->formatCurrency($order->total_amount));
        $lines[] = $this->formatLine('DP:', $this->formatCurrency($order->down_payment));
        $lines[] = $this->formatLine('Sisa:', $this->formatCurrency($order->remaining_payment));
        $lines[] = '';
        
        // Status
        $lines[] = 'Status: ' . ucfirst($order->status);
        $lines[] = '';
        
        // Footer
        $lines[] = $this->centerText('Terima kasih!');
        $lines[] = $this->centerText('Dicetak: ' . now()->format('d/m/Y H:i'));
        
        // Cut paper (ESC/POS command)
        $lines[] = chr(29) . chr(86) . chr(0);
        
        return implode("\n", $lines);
    }

    /**
     * Print using escpos-php library
     */
    private function printWithEscpos($content)
    {
        try {
            // If using Mike42/escpos-php library
            if (class_exists('\Mike42\Escpos\Printer')) {
                $connector = new \Mike42\Escpos\PrintConnectors\WindowsPrintConnector($this->printerName);
                $printer = new \Mike42\Escpos\Printer($connector);
                
                // Print content
                $printer->text($content);
                $printer->cut();
                $printer->close();
                
                return true;
            }
            
            // Fallback: Log the receipt
            \Log::info('Receipt printed', ['content' => $content]);
            return true;
            
        } catch (\Exception $e) {
            \Log::error('Print failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Print using system command (for Windows/Linux)
     */
    private function printWithSystemCommand($content)
    {
        try {
            // Save to temp file
            $tempFile = storage_path('app/temp/receipt.txt');
            file_put_contents($tempFile, $content);
            
            // Windows: use lpr or print command
            if (PHP_OS_FAMILY === 'Windows') {
                exec('print /D:' . $this->printerName . ' ' . escapeshellarg($tempFile));
            } else {
                // Linux: use lpr
                exec('lpr -P ' . escapeshellarg($this->printerName) . ' ' . escapeshellarg($tempFile));
            }
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Print failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Center text based on printer width
     */
    private function centerText($text)
    {
        $textLength = strlen($text);
        $padding = floor(($this->printerWidth - $textLength) / 2);
        return str_repeat(' ', $padding) . $text;
    }

    /**
     * Format line for receipt
     */
    private function formatLine($col1, $col2, $col3 = '', $col4 = '')
    {
        $width = $this->printerWidth;
        
        if ($col4) {
            $line = str_pad($col1, 20) . str_pad($col2, 10) . str_pad($col3, 12) . $col4;
        } elseif ($col3) {
            $line = str_pad($col1, 20) . str_pad($col2, 20) . $col3;
        } else {
            $line = str_pad($col1, 20) . $col2;
        }
        
        return substr($line, 0, $width);
    }

    /**
     * Format currency
     */
    private function formatCurrency($amount)
    {
        return 'Rp ' . number_format($amount, 0, ',', '.');
    }

    /**
     * Truncate text to fit width
     */
    private function truncateText($text, $maxLength)
    {
        if (strlen($text) <= $maxLength) {
            return $text;
        }
        return substr($text, 0, $maxLength - 3) . '...';
    }
}