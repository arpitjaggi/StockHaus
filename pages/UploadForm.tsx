import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Loader2, ArrowRight } from 'lucide-react';
import { db } from '../lib/db';
import { PaintingFormData } from '../types';
import { useNavigate } from 'react-router-dom';

const INITIAL_STATE: PaintingFormData = {
  serialNumber: '',
  name: '',
  width: '',
  height: '',
  unit: 'cm',
  quantity: '1',
  rate: '',
  image: null,
};

export const UploadForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PaintingFormData>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to handle image resize (prevent localstorage overflow)
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality JPEG
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await processImage(file);
        setFormData(prev => ({ ...prev, image: base64 }));
      } catch (err) {
        console.error("Error processing image", err);
        alert("Failed to process image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert("Please upload an image of the painting.");
      return;
    }

    setIsSubmitting(true);

    try {
      await db.addPainting({
        serialNumber: formData.serialNumber,
        name: formData.name,
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        unit: formData.unit,
        quantity: parseInt(formData.quantity),
        rate: formData.rate ? parseFloat(formData.rate) : undefined,
        image: formData.image,
      });

      setShowSuccess(true);
      setFormData(INITIAL_STATE);
      // Reset success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert("Error saving painting data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common input class for consistency across the app
  const inputClass = "w-full h-12 px-4 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-300 text-slate-900";

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Add New Inventory</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-sm text-brand-600 font-medium hover:text-brand-700"
        >
          View Dashboard
        </button>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-green-500 text-white p-1 rounded-full">
            <Check size={16} />
          </div>
          <div>
            <p className="text-green-800 font-semibold">Success!</p>
            <p className="text-green-600 text-sm">Item added to inventory.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        
        {/* Image Section */}
        <div className="p-6 border-b border-slate-100">
          <label className="block text-sm font-medium text-slate-700 mb-2">Painting Image</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
              formData.image 
                ? 'border-transparent bg-slate-900' 
                : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-brand-400'
            }`}
          >
            {formData.image ? (
              <>
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  className="w-full h-full object-contain rounded-xl" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                  <p className="text-white font-medium flex items-center gap-2">
                    <Camera size={20} /> Change Photo
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <div className="bg-white text-brand-500 shadow-sm p-3 rounded-full inline-flex mb-3">
                  <Camera size={24} />
                </div>
                <p className="text-slate-900 font-medium">Tap to upload</p>
                <p className="text-slate-400 text-xs mt-1">Camera or Gallery</p>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange} 
            />
          </div>
        </div>

        {/* Fields Section */}
        <div className="p-6 space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Serial Number</label>
            <input
              required
              type="text"
              placeholder="e.g. SN-2024-001"
              value={formData.serialNumber}
              onChange={e => setFormData({...formData, serialNumber: e.target.value})}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Sunset over Venice"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Width</label>
              <input
                required
                type="number"
                min="0"
                step="0.1"
                placeholder="0.0"
                value={formData.width}
                onChange={e => setFormData({...formData, width: e.target.value})}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Height</label>
              <input
                required
                type="number"
                min="0"
                step="0.1"
                placeholder="0.0"
                value={formData.height}
                onChange={e => setFormData({...formData, height: e.target.value})}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit</label>
            <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
              {(['cm', 'in'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setFormData({...formData, unit: u})}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    formData.unit === u 
                      ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity</label>
              <input
                required
                type="number"
                min="1"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rate <span className="text-slate-400 font-normal">(Optional)</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-sans">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.rate}
                  onChange={e => setFormData({...formData, rate: e.target.value})}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold rounded-xl shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                Save Item <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};