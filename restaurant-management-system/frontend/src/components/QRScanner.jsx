import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { toast } from 'react-hot-toast';

const QRScanner = () => {
  const [tableNumber, setTableNumber] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const scanTimeout = useRef(null);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableFromUrl = searchParams.get('table');

  // Clear any existing timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (tableFromUrl) {
      handleTableSelect(tableFromUrl);
    }
  }, [tableFromUrl]);

  useEffect(() => {
    if (isScanning && videoRef.current && !qrScannerRef.current) {
      startScanner();
    } else if (!isScanning && qrScannerRef.current) {
      stopScanner();
    }
  }, [isScanning]);

  const handleTableSelect = (tableNum) => {
    // Parse table number from URL format
    let finalTableNumber = tableNum;
    
    // Handle URL format: http://localhost:3000/?table=5
    if (typeof tableNum === 'string' && tableNum.includes('table=')) {
      const urlMatch = tableNum.match(/table=(\d+)/);
      if (urlMatch) {
        finalTableNumber = urlMatch[1];
      }
    }
    
    // Extract number from string if not already a number
    if (typeof finalTableNumber === 'string') {
      const numberMatch = finalTableNumber.match(/\d+/);
      if (numberMatch) {
        finalTableNumber = numberMatch[0];
      }
    }
    
    // Validate table number
    const parsedTable = parseInt(finalTableNumber);
    if (!parsedTable || parsedTable < 1 || parsedTable > 20) {
      toast.error('Invalid table number in QR code. Please check the QR code and try again.');
      return;
    }
    
    // Store table number in localStorage
    localStorage.setItem('currentTable', parsedTable.toString());
    
    // Redirect to menu with table number
    navigate(`/menu?table=${parsedTable}`, { replace: true });
    
    toast.success(`Table ${parsedTable} selected`);
  };

  const handleScan = (result) => {
    if (result) {
      // Clear any existing timeout
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
      
      // Add small delay to prevent multiple scans
      scanTimeout.current = setTimeout(() => {
        try {
          setCameraError(null);
          
          // Handle URL-based QR codes (our format: http://localhost:3000/?table=5)
          if (typeof result === 'string') {
            // Check if it's a URL with table parameter
            if (result.includes('table=')) {
              handleTableSelect(result);
              return;
            }
            
            // Check if it's a simple number
            const numberMatch = result.match(/^\d+$/);
            if (numberMatch) {
              handleTableSelect(numberMatch[0]);
              return;
            }
            
            // Try to parse as JSON for other formats
            try {
              const data = JSON.parse(result);
              if (data.tableNumber) {
                handleTableSelect(data.tableNumber.toString());
              } else if (data.table) {
                handleTableSelect(data.table.toString());
              } else if (data.id) {
                handleTableSelect(data.id.toString());
              } else {
                throw new Error('No table number found in QR code');
              }
            } catch (jsonError) {
              throw new Error('Invalid QR code format. Expected URL with table parameter or table number.');
            }
          } else {
            throw new Error('Invalid QR code format');
          }
        } catch (error) {
          console.error('Error processing QR code:', error);
          if (!cameraError) {
            setCameraError('Could not read QR code. Please ensure it\'s a valid restaurant QR code with table information.');
          }
        }
      }, 500);
    }
  };

  const handleError = (error) => {
    console.error('Camera error:', error);
    if (error.name === 'NotAllowedError') {
      setCameraError('Camera access denied. Please allow camera permissions or use manual table assignment.');
    } else if (error.name === 'NotFoundError') {
      setCameraError('No camera found. Please use manual table assignment.');
    } else if (error.name === 'NotSupportedError' || error.message.includes('https')) {
      setCameraError('Camera requires HTTPS connection. Please use manual table assignment below.');
    } else {
      setCameraError('Camera error occurred. Please use manual table assignment below.');
    }
    setIsScanning(false);
  };

  const startScanner = async () => {
    try {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      await qrScannerRef.current.start();
      setCameraError(null);
    } catch (error) {
      console.error('Failed to start scanner:', error);
      setCameraError('Could not access camera. Please check permissions and try again.');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  const toggleCamera = () => {
    setIsScanning(!isScanning);
    setCameraError(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Scan Table QR Code</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden mb-6">
          {isScanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                playsInline
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100">
              <p className="text-gray-500">Camera is off</p>
            </div>
          )}
          
          {cameraError && (
            <div className="p-4 bg-red-50 text-red-700 text-sm">
              {cameraError}
            </div>
          )}
          
          <div className="p-2 bg-gray-50 flex justify-center">
            <button
              onClick={toggleCamera}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {isScanning ? 'Turn off camera' : 'Turn on camera'}
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {isScanning && !cameraError 
              ? "Point your camera at a QR code to automatically select a table" 
              : cameraError 
                ? "Camera not available. Use manual table assignment below."
                : "Turn on camera to scan QR code or use manual assignment"
            }
          </p>
          
          {/* Manual Table Selection */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-3">Manual Table Assignment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your table number or get a random assignment:
            </p>
            <div className="flex gap-2 justify-center">
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && tableNumber) {
                    handleTableSelect(tableNumber);
                  }
                }}
                placeholder="Enter table number (1-20)"
                className="flex-1 max-w-xs px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="20"
              />
              <button
                onClick={() => handleTableSelect(tableNumber)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!tableNumber}
              >
                Use Table
              </button>
              <button
                onClick={() => handleTableSelect('auto')}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Random Table
              </button>
            </div>
          </div>
          
          {cameraError && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Camera Issue:</strong> {cameraError}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Note: Modern browsers require HTTPS for camera access. Use manual assignment above.
              </p>
            </div>
          )}
        </div>
        
        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Customer Login Option */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Sign in instantly with phone number</p>
          <button
            onClick={() => navigate('/customer-login')}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-teal-800 transition-all duration-200 shadow-lg"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Instant Login (No Code)
          </button>
          <p className="text-xs text-gray-500 mt-2">
            No verification required - just your phone number
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
