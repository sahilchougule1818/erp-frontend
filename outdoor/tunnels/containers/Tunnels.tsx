import { useState, useEffect } from 'react';
import { Button }   from '../../../shared/ui/button';
import { Input }    from '../../../shared/ui/input';
import { Label }    from '../../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/ui/dialog';
import { Plus, Pencil } from 'lucide-react';
import { DataTable } from '../../../shared/components/DataTable';
import { outdoorApi } from '../../services/outdoorApi';
import type { Tunnel } from '../../types/outdoor.types';

const UNITS = ['A', 'B', 'C', 'D', 'E'] as const;
const TUNNEL_COUNTS: Record<string, number> = { A: 10, B: 10, C: 10, D: 10, E: 8 };

export function Tunnels() {
  const [tunnels, setTunnels]               = useState<Tunnel[]>([]);
  const [isAddOpen, setIsAddOpen]           = useState(false);
  const [isEditOpen, setIsEditOpen]         = useState(false);
  const [selectedUnit, setSelectedUnit]     = useState('');
  const [selectedTunnel, setSelectedTunnel] = useState('');
  const [capacity, setCapacity]             = useState('');
  const [editingTunnel, setEditingTunnel]   = useState<Tunnel | null>(null);
  const [editCapacity, setEditCapacity]     = useState('');

  const tunnelOptions = selectedUnit
    ? Array.from({ length: TUNNEL_COUNTS[selectedUnit] }, (_, i) => `${selectedUnit}${i + 1}`)
    : [];

  useEffect(() => { fetchTunnels(); }, []);

  const fetchTunnels = async () => {
    try {
      const data = await outdoorApi.tunnels.getAll();
      setTunnels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch tunnels:', error);
    }
  };

  const handleTunnelSelect = (tunnel: string) => {
    setSelectedTunnel(tunnel);
    const existing = tunnels.find(t => t.name === tunnel);
    setCapacity(existing?.capacity ? String(existing.capacity) : '');
  };

  const handleAdd = async () => {
    if (!selectedTunnel) return;
    try {
      await outdoorApi.tunnels.create({ tunnelName: selectedTunnel, capacity: Number(capacity) || 0 });
      await fetchTunnels();
      setIsAddOpen(false);
      setSelectedUnit('');
      setSelectedTunnel('');
      setCapacity('');
    } catch (error) {
      console.error('Failed to save tunnel:', error);
    }
  };

  const openEdit = (tunnel: Tunnel) => {
    setEditingTunnel(tunnel);
    setEditCapacity(tunnel.capacity ? String(tunnel.capacity) : '');
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingTunnel) return;
    try {
      await outdoorApi.tunnels.create({ tunnelName: editingTunnel.name, capacity: Number(editCapacity) || 0 });
      await fetchTunnels();
      setIsEditOpen(false);
      setEditingTunnel(null);
      setEditCapacity('');
    } catch (error) {
      console.error('Failed to update tunnel:', error);
    }
  };

  const columns = [
    { key: 'name',      label: 'Tunnel' },
    { key: 'capacity',  label: 'Capacity', render: (v: number) => v > 0 ? v.toLocaleString() : '—' },
    { key: 'is_active', label: 'Status',   render: (v: boolean) => v ? 'Active' : 'Inactive' },
    {
      key: '_edit',
      label: '',
      render: (_: any, row: Tunnel) => (
        <Button size="sm" variant="ghost" onClick={() => openEdit(row)} className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="mt-6">
      {/* Edit capacity dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Capacity — {editingTunnel?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Capacity <span className="text-slate-400 font-normal">(visual only — no hard limit)</span></Label>
              <Input
                type="number"
                value={editCapacity}
                onChange={e => setEditCapacity(e.target.value)}
                placeholder="e.g. 2000"
                min="0"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleEdit} className="flex-1 bg-green-600 hover:bg-green-700">Update</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DataTable
        title="Tunnel Master"
        columns={columns}
        records={tunnels}
        exportFileName="tunnels"
        addButton={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />Add Tunnel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Tunnel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Unit</Label>
                  <Select onValueChange={(u) => { setSelectedUnit(u); setSelectedTunnel(''); setCapacity(''); }} value={selectedUnit}>
                    <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                    <SelectContent>
                      {UNITS.map(u => <SelectItem key={u} value={u}>Unit {u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {selectedUnit && (
                  <div>
                    <Label>Tunnel</Label>
                    <Select onValueChange={handleTunnelSelect} value={selectedTunnel}>
                      <SelectTrigger><SelectValue placeholder="Select tunnel" /></SelectTrigger>
                      <SelectContent>
                        {tunnelOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {selectedTunnel && (
                  <div>
                    <Label>Capacity <span className="text-slate-400 font-normal">(visual only — no hard limit)</span></Label>
                    <Input
                      type="number"
                      value={capacity}
                      onChange={e => setCapacity(e.target.value)}
                      placeholder="e.g. 2000"
                      min="0"
                    />
                  </div>
                )}
                <Button onClick={handleAdd} disabled={!selectedTunnel} className="w-full bg-green-600 hover:bg-green-700">
                  Add Tunnel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
    </div>
  );
}
