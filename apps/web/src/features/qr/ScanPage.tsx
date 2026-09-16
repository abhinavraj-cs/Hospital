import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import { QrCode, MapPin } from 'lucide-react';

export function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    // Basic setup for html5-qrcode scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        scanner.clear();
      },
      (error) => {
        // Handle scan failure silently
      }
    );

    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Scan Location QR</h1>
        <p className="text-muted-foreground mt-2">
          Find a QR code on the wall and scan it to instantly update your current location on the map.
        </p>
      </div>

      {!scanResult ? (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <div id="qr-reader" className="w-full" />
        </div>
      ) : (
        <div className="p-8 border rounded-xl bg-card text-center space-y-4 animate-in zoom-in-95">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-600">Location Found!</h2>
          <p className="text-lg">You are currently at: <span className="font-semibold">Main Entrance (Ground Floor)</span></p>
          <p className="text-sm text-muted-foreground break-all">QR Data: {scanResult}</p>
          
          <div className="pt-6 space-x-4">
            <button 
              className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium"
              onClick={() => window.location.href = '/navigate'}
            >
              Open Map Here
            </button>
            <button 
              className="border px-6 py-2 rounded font-medium hover:bg-slate-50"
              onClick={() => setScanResult(null)}
            >
              Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
