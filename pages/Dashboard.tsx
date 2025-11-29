import React, { useEffect, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Search, Download, Trash2, ExternalLink, 
  ArrowUpDown, Filter, AlertCircle, X
} from 'lucide-react';
import { db } from '../lib/db';
import { Painting, SortField, SortOrder } from '../types';

export const Dashboard: React.FC = () => {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await db.getAllPaintings();
    setPaintings(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await db.deletePainting(id);
      loadData();
    }
  };

  const handleExport = () => {
    const exportData = paintings.map(p => ({
      'Serial Number': p.serialNumber,
      'Item Name': p.name,
      'Dimensions': `${p.width} x ${p.height} ${p.unit}`,
      'Quantity': p.quantity,
      'Rate (INR)': p.rate || 0,
      'Total Value (INR)': p.quantity * (p.rate || 0),
      'Date Added': new Date(p.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "StockHaus_Inventory.xlsx");
  };

  const filteredAndSortedData = useMemo(() => {
    return paintings
      .filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle string comparison for consistent sorting
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        // Handle undefined rates in sorting
        if (sortField === 'rate') {
            aValue = (a.rate || 0);
            bValue = (b.rate || 0);
        }

        if (aValue! < bValue!) return sortOrder === 'asc' ? -1 : 1;
        if (aValue! > bValue!) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [paintings, searchTerm, sortField, sortOrder]);

  const stats = useMemo(() => {
    return {
      totalItems: paintings.reduce((acc, curr) => acc + curr.quantity, 0),
      totalValue: paintings.reduce((acc, curr) => acc + (curr.quantity * (curr.rate || 0)), 0),
      uniqueTitles: paintings.length
    };
  }, [paintings]);

  const SortHeader: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <th 
      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors"
      onClick={() => {
        if (sortField === field) {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
          setSortField(field);
          setSortOrder('desc'); // Default to desc for new sort
        }
      }}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={14} className={sortField === field ? 'text-brand-600' : 'text-slate-300'} />
      </div>
    </th>
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Inventory Value</p>
          <h3 className="text-3xl font-bold text-slate-900 font-sans">
            ₹{stats.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Quantity</p>
          <h3 className="text-3xl font-bold text-slate-900">{stats.totalItems}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Unique Titles</p>
          <h3 className="text-3xl font-bold text-slate-900">{stats.uniqueTitles}</h3>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by serial or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none shadow-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Img</th>
                <SortHeader field="serialNumber" label="Serial #" />
                <SortHeader field="name" label="Item Name" />
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dimensions</th>
                <SortHeader field="quantity" label="Qty" />
                <SortHeader field="rate" label="Rate" />
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAndSortedData.length > 0 ? (
                filteredAndSortedData.map((painting) => (
                  <tr key={painting.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setPreviewImage(painting.imageUrl)}
                        className="relative group w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white"
                      >
                        <img src={painting.imageUrl} alt={painting.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center">
                          <ExternalLink size={12} className="text-white" />
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{painting.serialNumber}</td>
                    <td className="px-6 py-4 text-slate-900 font-semibold">{painting.name}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {painting.width} × {painting.height} <span className="text-xs uppercase">{painting.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {painting.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-sans">
                      {painting.rate !== undefined && painting.rate !== 0 
                        ? `₹${painting.rate.toFixed(2)}` 
                        : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 font-sans">
                      {painting.rate ? `₹${(painting.quantity * painting.rate).toFixed(2)}` : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(painting.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Filter size={48} className="mb-4 text-slate-200" />
                      <p className="text-lg font-medium text-slate-500">No items found</p>
                      <p className="text-sm">Try adjusting your search terms or add a new item.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white"
            >
              <span className="sr-only">Close</span>
              <div className="bg-white/10 p-2 rounded-full backdrop-blur-md">
                <X size={24} />
              </div>
            </button>
            <img 
              src={previewImage} 
              alt="Full size preview" 
              className="w-full h-full object-contain rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
};