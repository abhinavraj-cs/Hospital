import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery, useMutation } from '@tanstack/react-query';
import { navigationApi } from '../../services/api.service';
import { voiceService } from '../../services/voice.service';
import { MapPin, Navigation, Volume2, VolumeX, Layers, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const ROUTE_PREFERENCES = [
  { value: 'SHORTEST', label: 'Shortest Route' },
  { value: 'FASTEST', label: 'Fastest Route' },
  { value: 'ACCESSIBLE', label: 'Wheelchair Accessible' },
  { value: 'AVOID_STAIRS', label: 'Avoid Stairs' },
  { value: 'EMERGENCY', label: 'Emergency Route' },
];

const DISPLAY_NODE_POSITIONS: Record<string, L.LatLngExpression> = {
  'Main Lobby (Health Info)': [150, 350],
  'Admitting / Registration': [150, 525],
  Pharmacy: [320, 525],
  Lab: [240, 525],
  'Emergency Department': [175, 225],
  'Urgent Care Check-In': [425, 250],
  'Visitor Elevators': [875, 300],
  'Radiology (X-Ray)': [510, 300],
  'Clinic Corridor': [450, 680],
  'Pediatrics Clinic': [610, 837],
  'Surgery Clinic': [710, 790],
  'Internal Medicine': [210, 790],
};

function getDisplayPosition(node: { label?: string; x: number; y: number }): L.LatLngExpression {
  return DISPLAY_NODE_POSITIONS[node.label || ''] || [node.y, node.x];
}

// Fix Leaflet default icon issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function NavigationMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const routeLayer = useRef<L.LayerGroup | null>(null);

  const [fromNode, setFromNode] = useState('');
  const [toNode, setToNode] = useState('');
  const [preference, setPreference] = useState('SHORTEST');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [activeInstruction, setActiveInstruction] = useState(0);
  const [routeData, setRouteData] = useState<any>(null);

  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['nav-nodes'],
    queryFn: () => navigationApi.getNodes(),
  });

  const routeMutation = useMutation({
    mutationFn: () => navigationApi.getRoute(fromNode, toNode, preference),
    onSuccess: (data) => {
      setRouteData(data);
      drawRoute(data);
      if (voiceEnabled && data.instructions?.[0]) {
        voiceService.speak(data.instructions[0].text);
      }
      toast.success(`Route found: ${data.totalDistance?.toFixed(0)}m, ~${data.estimatedTimeMinutes?.toFixed(0)} min`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not calculate route');
    },
  });

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 3,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const bounds: L.LatLngBoundsExpression = [[0, 0], [1200, 1000]];

    L.imageOverlay('/map.png', bounds).addTo(map);
    map.fitBounds(bounds, { padding: [20, 20] });

    routeLayer.current = L.layerGroup().addTo(map);
    leafletMap.current = map;
    return () => { map.remove(); leafletMap.current = null; };
  }, []);

  const drawRoute = useCallback((data: any) => {
    if (!routeLayer.current || !leafletMap.current) return;
    routeLayer.current.clearLayers();

    const path = data.path as any[];
    if (!path || path.length < 2) return;

    const coords = path.map((n: any) => getDisplayPosition(n));

    // Draw animated polyline
    const routeLine = L.polyline(coords, {
      color: '#0ea5e9',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    });
    routeLayer.current.addLayer(routeLine);

    leafletMap.current.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
  }, []);

  const handleVoiceToggle = () => {
    const newVal = !voiceEnabled;
    setVoiceEnabled(newVal);
    voiceService.setEnabled(newVal);
    if (!voiceService.isSupported()) {
      toast.warning('Voice navigation is not supported in this browser.');
    }
  };

  const goToInstruction = (i: number) => {
    setActiveInstruction(i);
    if (voiceEnabled && routeData?.instructions?.[i]) {
      voiceService.speak(routeData.instructions[i].text);
    }

    const instruction = routeData?.instructions?.[i];
    const nodeId = instruction?.toNode || instruction?.fromNode;
    const node = nodes.find((item: any) => item.id === nodeId);
    if (node && leafletMap.current) {
      leafletMap.current.setView(
        getDisplayPosition(node),
        Math.max(leafletMap.current.getZoom(), 1),
        { animate: true },
      );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Control Bar */}
      <div className="bg-white border-b shadow-sm p-3 flex flex-wrap gap-3 items-center">
        <MapPin className="h-5 w-5 text-sky-500 shrink-0" />
        <select
          className="flex-1 min-w-[160px] border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-sky-500 outline-none"
          value={fromNode}
          onChange={e => setFromNode(e.target.value)}
        >
          <option value="">From: Select node...</option>
          {nodes.map((n: any) => (
            <option key={n.id} value={n.id}>{n.label || n.nodeType}</option>
          ))}
        </select>

        <Navigation className="h-5 w-5 text-emerald-500 shrink-0" />
        <select
          className="flex-1 min-w-[160px] border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-sky-500 outline-none"
          value={toNode}
          onChange={e => setToNode(e.target.value)}
        >
          <option value="">To: Select destination...</option>
          {nodes.map((n: any) => (
            <option key={n.id} value={n.id}>{n.label || n.nodeType}</option>
          ))}
        </select>

        <select
          className="border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-sky-500 outline-none"
          value={preference}
          onChange={e => setPreference(e.target.value)}
        >
          {ROUTE_PREFERENCES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <button
          onClick={() => routeMutation.mutate()}
          disabled={!fromNode || !toNode || routeMutation.isPending}
          className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm"
        >
          {routeMutation.isPending ? 'Routing...' : 'Get Route'}
        </button>

        <button
          onClick={handleVoiceToggle}
          title={voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
          className={`p-2 rounded-lg border transition-colors ${voiceEnabled ? 'bg-sky-100 border-sky-300 text-sky-700' : 'border-slate-200 text-slate-500'}`}
        >
          {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        <button
          onClick={() => { setFromNode(''); setToNode(''); setRouteData(null); routeLayer.current?.clearLayers(); }}
          title="Reset"
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-red-500 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Map + Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <div ref={mapRef} className="flex-1 z-0" />

        {/* Instructions Panel */}
        <div className="w-72 bg-white border-l flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Layers className="h-4 w-4" /> Turn-by-Turn Directions
            </h3>
            {routeData && (
              <div className="mt-2 text-xs text-slate-500 space-y-1">
                <div>Distance: <span className="font-semibold text-slate-700">{routeData.totalDistance?.toFixed(0)}m</span></div>
                <div>Est. Time: <span className="font-semibold text-slate-700">~{routeData.estimatedTimeMinutes?.toFixed(0)} min</span></div>
                <div>Floors: <span className="font-semibold text-slate-700">{routeData.floorsTraversed}</span></div>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {routeData?.instructions?.length ? (
              routeData.instructions.map((inst: any, i: number) => (
                <button
                  key={i}
                  onClick={() => goToInstruction(i)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                    i === activeInstruction
                      ? 'bg-sky-50 border-sky-300 text-sky-800'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-semibold mr-2 text-sky-600">{i + 1}.</span>
                  {inst.text}
                  {inst.distance && (
                    <span className="text-xs text-slate-400 ml-1">({inst.distance}m)</span>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center text-slate-400 mt-8 text-sm">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Select start and destination,<br />then click <strong>Get Route</strong>.</p>
                <p className="mt-3 text-xs opacity-70">Tip: Click nodes on the map to set From/To.</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="p-3 border-t bg-slate-50 text-xs space-y-3">
            <div>
              <p className="font-semibold text-slate-600 mb-2">Map Areas</p>
              {[
                { color: '#73b6cc', label: 'Outpatient clinics' },
                { color: '#0f9d91', label: 'Rehabilitation services' },
                { color: '#ffca28', label: 'Urgent care / emergency' },
                { color: '#d83c2d', label: 'Pharmacy, lab, admitting' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: item.color }} />
                  <span className="text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="font-semibold text-slate-600 mb-2">Navigation Markers</p>
              {[
                { color: '#22c55e', label: 'Entrance / route start' },
                { color: '#ef4444', label: 'Emergency / route destination' },
                { color: '#f59e0b', label: 'Elevator' },
                { color: '#3b82f6', label: 'Room, department, corridor' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
