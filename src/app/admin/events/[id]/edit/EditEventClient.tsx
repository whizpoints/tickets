'use client'

import React, { useState } from 'react';
import { updatePackage } from '@/actions/event';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditEventClient({ event, packages }: { event: any, packages: any[] }) {
  const router = useRouter();
  const [pkgs, setPkgs] = useState(packages);
  const [isSaving, setIsSaving] = useState(false);

  const handleCapacityChange = (id: string, value: string) => {
    setPkgs(pkgs.map(p => p.id === id ? { ...p, capacity: parseInt(value) || 0 } : p));
  };

  const handleSave = async () => {
    setIsSaving(true);
    toast.loading("Saving changes...", { id: "save" });
    try {
      for (const p of pkgs) {
        await updatePackage(p.id, p.capacity);
      }
      toast.success("Updated successfully", { id: "save" });
      router.push('/dashboard');
    } catch (e) {
      toast.error("Failed to update", { id: "save" });
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8 border-b pb-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Edit Packages: {event.title}</h1>
        </div>

        <div className="space-y-6">
          {pkgs.map(pkg => (
            <div key={pkg.id} className="p-4 border rounded-xl bg-gray-50">
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold text-lg">{pkg.name}</h3>
                <span className="text-gray-500">Sold: {pkg.sold}</span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Total Capacity (Total Amount of Tickets)</label>
                <input 
                  type="number"
                  value={pkg.capacity}
                  onChange={(e) => handleCapacityChange(pkg.id, e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">
                  Remaining available: {Math.max(0, pkg.capacity - pkg.sold)}
                </span>
                <span className="text-xs text-blue-600">
                  * Note: If remaining hits 10 or less, price increases by 15% automatically!
                </span>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="mt-8 w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
