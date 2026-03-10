import { useState } from 'react';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';

const QRCodeGenerator = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTables, setSelectedTables] = useState([]);

  // Mock tables data - in real app, this would come from API
  const mockTables = [
    { id: 1, number: 1, location: 'Indoor', status: 'available' },
    { id: 2, number: 2, location: 'Indoor', status: 'available' },
    { id: 3, number: 3, location: 'Outdoor', status: 'available' },
    { id: 4, number: 4, location: 'Indoor', status: 'occupied' },
    { id: 5, number: 5, location: 'Outdoor', status: 'available' },
    { id: 6, number: 6, location: 'Indoor', status: 'available' },
  ];

  useState(() => {
    setTables(mockTables);
  }, []);

  const generateQRCode = async (table) => {
    try {
      setLoading(true);
      
      // Create URL that points to home page with table parameter
      const qrUrl = `${window.location.origin}/?table=${table.number}`;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `table-${table.number}-qrcode.png`;
      link.href = qrDataUrl;
      link.click();

      toast.success(`QR code for Table ${table.number} downloaded successfully!`);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const generateAllQRCodes = async () => {
    try {
      setLoading(true);
      
      for (const table of tables) {
        const qrUrl = `${window.location.origin}/?table=${table.number}`;
        const qrDataUrl = await QRCode.toDataURL(qrUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // Create download link for each table
        const link = document.createElement('a');
        link.download = `table-${table.number}-qrcode.png`;
        link.href = qrDataUrl;
        link.click();

        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success('All table QR codes downloaded successfully!');
    } catch (error) {
      console.error('Error generating QR codes:', error);
      toast.error('Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  const toggleTableSelection = (tableId) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const generateSelectedQRCodes = async () => {
    if (selectedTables.length === 0) {
      toast.error('Please select at least one table');
      return;
    }

    try {
      setLoading(true);
      
      const selectedTableData = tables.filter(table => selectedTables.includes(table.id));
      
      for (const table of selectedTableData) {
        const qrUrl = `${window.location.origin}/?table=${table.number}`;
        const qrDataUrl = await QRCode.toDataURL(qrUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        const link = document.createElement('a');
        link.download = `table-${table.number}-qrcode.png`;
        link.href = qrDataUrl;
        link.click();

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success(`${selectedTables.length} QR codes downloaded successfully!`);
      setSelectedTables([]);
    } catch (error) {
      console.error('Error generating QR codes:', error);
      toast.error('Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Table QR Codes</h2>
        <div className="flex space-x-3">
          <button
            onClick={generateAllQRCodes}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Generating...' : 'Download All QR Codes'}
          </button>
          <button
            onClick={generateSelectedQRCodes}
            disabled={loading || selectedTables.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Generating...' : `Download Selected (${selectedTables.length})`}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">QR Code Instructions</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>Each QR code will direct customers to the home page with table parameter</li>
          <li>Customers can scan QR code to access the restaurant menu</li>
          <li>QR codes contain table information for automatic table assignment</li>
          <li>Print QR codes and place them on each table for easy scanning</li>
        </ul>
      </div>

      {/* Tables List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Restaurant Tables</h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectedTables.length === tables.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTables(tables.map(table => table.id));
                  } else {
                    setSelectedTables([]);
                  }
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="selectAll" className="text-sm text-gray-700">
                Select All
              </label>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedTables.length === tables.length && tables.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTables(tables.map(table => table.id));
                      } else {
                        setSelectedTables([]);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QR Code URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tables.map((table) => (
                <tr key={table.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTables.includes(table.id)}
                      onChange={() => toggleTableSelection(table.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Table {table.number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{table.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      table.status === 'available' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {table.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {`${window.location.origin}/?table=${table.number}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => generateQRCode(table)}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    >
                      Generate QR Code
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
