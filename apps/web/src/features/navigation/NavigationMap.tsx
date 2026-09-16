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

// Fix Leaflet default icon issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createColoredIcon(color: string) {
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
    <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
  </svg>`;
  return L.divIcon({
    html: svgIcon,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function NavigationMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const routeLayer = useRef<L.LayerGroup | null>(null);
  const nodeLayer = useRef<L.LayerGroup | null>(null);

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
      minZoom: -2,
      maxZoom: 4,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const bounds: L.LatLngBoundsExpression = [[0, 0], [1000, 1000]];

    // Draw a simple floor plan background
    const floorPlanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
      <rect width="1000" height="1000" fill="#f8f9fa"/>
      <!-- Main corridors -->
      <rect x="0" y="480" width="1000" height="40" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="480" y="0" width="40" height="1000" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1"/>
      <!-- Rooms -->
      <rect x="20" y="20" width="200" height="140" rx="4" fill="white" stroke="#94a3b8" stroke-width="2"/>
      <text x="120" y="95" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="14">Emergency</text>
      <rect x="260" y="20" width="180" height="140" rx="4" fill="white" stroke="#94a3b8" stroke-width="2"/>
      <text x="350" y="95" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="14">Radiology</text>
      <rect x="560" y="20" width="180" height="140" rx="4" fill="white" stroke="#94a3b8" stroke-width="2"/>
      <text x="650" y="95" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="14">Cardiology</text>
      <rect x="780" y="20" width="200" height="140" rx="4" fill="white" stroke="#94a3b8" stroke-width="2"/>
      <text x="880" y="95" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="14">Pharmacy</text>
      <rect x="20" y="560" width="200" height="140" rx="4" fill="white" stroke="#94a3b8" stroke-width="2"/>
      <text x="120" y="635" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="14">ICU</text>
      <rect x="260" y="560" width="180" height="140" rx="4" fill="white" stroke="#94a3b8" stroke-width="2"/>
      <text x="350" y="635" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="14">Pathology</text>
      <rect x="560" y="560" width="180" height="140" rx="4" fill="white" stroke="#94a3b8" stroke-width="2"/>
      <text x="650" y="635" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="14">Pediatrics</text>
      <rect x="780" y="560" width="200" height="140" rx="4" fill="white" stroke="#94a3b8" stroke-width="2"/>
      <text x="880" y="635" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="14">OPD</text>
      <!-- Labels -->
      <text x="500" y="505" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="12" opacity="0.6">MAIN CORRIDOR</text>
    </svg>`;
    const blob = new Blob([floorPlanSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    L.imageOverlay(url, bounds).addTo(map);
    map.fitBounds(bounds, { padding: [20, 20] });

    routeLayer.current = L.layerGroup().addTo(map);
    nodeLayer.current = L.layerGroup().addTo(map);

    leafletMap.current = map;
    return () => { map.remove(); leafletMap.current = null; URL.revokeObjectURL(url); };
  }, []);

  // Draw nodes on map once loaded
  useEffect(() => {
    if (!nodeLayer.current || !nodes.length) return;
    nodeLayer.current.clearLayers();
    nodes.forEach((node: any) => {
      const marker = L.circleMarker([node.y, node.x] as L.LatLngExpression, {
        radius: 6,
        fillColor: node.nodeType === 'EMERGENCY' ? '#ef4444' :
                   node.nodeType === 'ENTRANCE' ? '#22c55e' :
                   node.nodeType === 'ELEVATOR' ? '#f59e0b' : '#3b82f6',
        color: 'white',
        weight: 2,
        fillOpacity: 0.9,
      });
      marker.bindTooltip(node.label || node.nodeType, { permanent: false });
      marker.on('click', () => {
        if (!fromNode) setFromNode(node.id);
        else if (!toNode) setToNode(node.id);
      });
      nodeLayer.current!.addLayer(marker);
    });
  }, [nodes, fromNode, toNode]);

  const drawRoute = useCallback((data: any) => {
    if (!routeLayer.current || !leafletMap.current) return;
    routeLayer.current.clearLayers();

    const path = data.path as any[];
    if (!path || path.length < 2) return;

    const coords = path.map((n: any) => [n.y, n.x] as L.LatLngExpression);

    // Draw animated polyline
    const routeLine = L.polyline(coords, {
      color: '#0ea5e9',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    });
    routeLayer.current.addLayer(routeLine);

    // Draw arrow decorations
    const arrowDecorator = (L as any).polylineDecorator?.(routeLine, {
      patterns: [{ offset: '5%', repeat: '15%', symbol: (L as any).Symbol?.arrowHead?.({ pixelSize: 12, fill: true, polygon: false, pathOptions: { color: '#0284c7', weight: 2 } }) }],
    });
    if (arrowDecorator) routeLayer.current.addLayer(arrowDecorator);

    // Start marker
    L.marker(coords[0] as L.LatLngExpression, { icon: createColoredIcon('#22c55e') })
      .bindPopup('Start').addTo(routeLayer.current!);
    // End marker  
    L.marker(coords[coords.length - 1] as L.LatLngExpression, { icon: createColoredIcon('#ef4444') })
      .bindPopup('Destination').addTo(routeLayer.current!);

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
            <option key={n.id} value={n.id}>{n.label || n.nodeType} ({n.id.slice(0, 8)})</option>
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
            <option key={n.id} value={n.id}>{n.label || n.nodeType} ({n.id.slice(0, 8)})</option>
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
          <div className="p-3 border-t bg-slate-50 text-xs space-y-1">
            <p className="font-semibold text-slate-600 mb-2">Legend</p>
            {[
              { color: '#22c55e', label: 'Entrance / Start' },
              { color: '#ef4444', label: 'Emergency / End' },
              { color: '#f59e0b', label: 'Elevator' },
              { color: '#3b82f6', label: 'Corridor / Room' },
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
  );
}
