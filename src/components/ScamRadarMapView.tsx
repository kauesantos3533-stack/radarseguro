// Source: Google Maps Platform Code Assist
import React, { useState, useMemo, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  MapControl,
  ControlPosition,
} from "@vis.gl/react-google-maps";
import {
  ShieldAlert,
  Shield,
  MapPin,
  AlertTriangle,
  Building2,
  Phone,
  ExternalLink,
  Search,
  PlusCircle,
  X,
  CheckCircle2,
  Radio,
  Flame,
  Key,
  Info,
  Navigation,
  Globe2,
  Compass,
  LocateFixed,
  Filter,
  Layers,
  ArrowRight,
} from "lucide-react";
import { CYBER_POLICE_UNITS, INITIAL_SCAM_INCIDENTS, DDD_DATABASE } from "../data/mapData";
import { ScamIncident, CyberPoliceUnit } from "../types";

// Haversine distance calculator in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Controller component to smoothly move the Google Map camera
const MapCameraController: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
}> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(zoom);
  }, [map, center, zoom]);

  return null;
};

// Brazilian Regional presets for quick navigation
const BRAZIL_REGIONS = [
  { id: "all", name: "🇧🇷 Todo o Brasil", lat: -14.235, lng: -51.9253, zoom: 4 },
  { id: "sudeste", name: "🏙️ Sudeste (SP/RJ/MG/ES)", lat: -21.8, lng: -45.5, zoom: 6 },
  { id: "sul", name: "🌲 Sul (PR/SC/RS)", lat: -27.5, lng: -51.5, zoom: 6 },
  { id: "nordeste", name: "☀️ Nordeste (BA/PE/CE...)", lat: -9.5, lng: -39.5, zoom: 5.5 },
  { id: "centro-oeste", name: "🏛️ Centro-Oeste (DF/GO/MT/MS)", lat: -15.5, lng: -54.0, zoom: 5.5 },
  { id: "norte", name: "🌿 Norte (PA/AM/TO...)", lat: -4.5, lng: -60.0, zoom: 5 },
];

export const ScamRadarMapView: React.FC = () => {
  // Load custom user reports from localStorage
  const [incidents, setIncidents] = useState<ScamIncident[]>(() => {
    const saved = localStorage.getItem("radar_seguro_user_incidents");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...parsed, ...INITIAL_SCAM_INCIDENTS];
      } catch {
        return INITIAL_SCAM_INCIDENTS;
      }
    }
    return INITIAL_SCAM_INCIDENTS;
  });

  const [filterType, setFilterType] = useState<"all" | "scams" | "police">("all");
  const [selectedIncident, setSelectedIncident] = useState<ScamIncident | null>(null);
  const [selectedPolice, setSelectedPolice] = useState<CyberPoliceUnit | null>(null);
  const [dddSearch, setDddSearch] = useState("");
  const [dddResult, setDddResult] = useState<any | null>(null);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    cityName?: string;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radiusFilterKm, setRadiusFilterKm] = useState<number | null>(null); // null = all, 50, 150, 500

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Map camera state
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: -14.235,
    lng: -51.9253, // Central Brazil
  });
  const [mapZoom, setMapZoom] = useState<number>(4.2);

  // New report modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Falsa Central Bancária (0800)");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("SP");
  const [newDdd, setNewDdd] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newAvgLoss, setNewAvgLoss] = useState("");

  // Optional manual API key configuration in localStorage or env
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem("gmaps_api_key") || "";
  });
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  const envApiKey = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || "";
  const effectiveApiKey = customApiKey.trim() || envApiKey.trim();

  // Geolocation trigger
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocalização não é suportada neste navegador.");
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const coords = { lat: latitude, lng: longitude, accuracy };
        setUserLocation(coords);
        setMapCenter({ lat: latitude, lng: longitude });
        setMapZoom(11);
        setRadiusFilterKm(150); // Automatically filter to 150 km proximity
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Permissão de localização negada pelo usuário.");
        } else {
          setLocationError("Não foi possível obter a sua localização exata.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Handle DDD Search
  const handleDddSearch = (query: string) => {
    setDddSearch(query);
    const cleaned = query.replace(/\D/g, "").slice(0, 2);
    if (cleaned && DDD_DATABASE[cleaned]) {
      const data = DDD_DATABASE[cleaned];
      setDddResult({ ddd: cleaned, ...data });
      setMapCenter({ lat: data.lat, lng: data.lng });
      setMapZoom(9);
    } else {
      setDddResult(null);
    }
  };

  const handleSelectIncident = (inc: ScamIncident) => {
    setSelectedPolice(null);
    setSelectedIncident(inc);
    setMapCenter({ lat: inc.lat, lng: inc.lng });
    setMapZoom(12);
  };

  const handleSelectPolice = (unit: CyberPoliceUnit) => {
    setSelectedIncident(null);
    setSelectedPolice(unit);
    setMapCenter({ lat: unit.lat, lng: unit.lng });
    setMapZoom(13);
  };

  const handleRegionSelect = (region: (typeof BRAZIL_REGIONS)[0]) => {
    setRadiusFilterKm(null);
    setMapCenter({ lat: region.lat, lng: region.lng });
    setMapZoom(region.zoom);
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCity.trim()) {
      alert("Preencha ao menos o título do golpe e a cidade.");
      return;
    }

    // Determine rough lat/lng from userLocation or DDD or state
    let lat = -23.5505;
    let lng = -46.6333;
    if (userLocation) {
      lat = userLocation.lat + (Math.random() - 0.5) * 0.02;
      lng = userLocation.lng + (Math.random() - 0.5) * 0.02;
    } else if (newDdd && DDD_DATABASE[newDdd]) {
      lat = DDD_DATABASE[newDdd].lat + (Math.random() - 0.5) * 0.05;
      lng = DDD_DATABASE[newDdd].lng + (Math.random() - 0.5) * 0.05;
    }

    const newReport: ScamIncident = {
      id: `user-inc-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      city: newCity,
      state: newState,
      ddd: newDdd || (userLocation ? "Local" : "11"),
      lat,
      lng,
      reportedCount: 1,
      avgLoss: newAvgLoss ? `R$ ${newAvgLoss}` : "Tentativa frustrada",
      riskLevel: "critical",
      date: "Registrado agora por você",
      details: newDetails || "Denúncia comunitária registrada no RadarSeguro.",
      suspectMethod: "Engenharia social relatada pela comunidade.",
    };

    const saved = localStorage.getItem("radar_seguro_user_incidents");
    let existing: ScamIncident[] = [];
    if (saved) {
      try {
        existing = JSON.parse(saved);
      } catch {}
    }
    const updated = [newReport, ...existing];
    localStorage.setItem("radar_seguro_user_incidents", JSON.stringify(updated));
    setIncidents([newReport, ...incidents]);

    setIsReportModalOpen(false);
    setSelectedIncident(newReport);
    setMapCenter({ lat, lng });
    setMapZoom(11);

    // Reset fields
    setNewTitle("");
    setNewCity("");
    setNewDetails("");
    setNewAvgLoss("");
  };

  // Filter and sort incidents by proximity if userLocation is active
  const filteredIncidents = useMemo(() => {
    if (filterType === "police") return [];

    let list = incidents;

    if (selectedCategory !== "all") {
      list = list.filter((inc) => inc.category === selectedCategory);
    }

    if (userLocation && radiusFilterKm !== null) {
      list = list.filter((inc) => {
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, inc.lat, inc.lng);
        return dist <= radiusFilterKm;
      });
    }

    // Sort by proximity if userLocation is known
    if (userLocation) {
      return [...list].sort((a, b) => {
        const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return list;
  }, [incidents, filterType, selectedCategory, userLocation, radiusFilterKm]);

  // Filter and sort police stations by proximity
  const filteredPolice = useMemo(() => {
    if (filterType === "scams") return [];

    let list = CYBER_POLICE_UNITS;

    if (userLocation && radiusFilterKm !== null) {
      list = list.filter((unit) => {
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, unit.lat, unit.lng);
        return dist <= radiusFilterKm * 2; // wider radius for police stations
      });
    }

    if (userLocation) {
      return [...list].sort((a, b) => {
        const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return list;
  }, [filterType, userLocation, radiusFilterKm]);

  // Nearest Cyber Police Unit for quick alert banner
  const nearestPoliceUnit = useMemo(() => {
    if (!userLocation) return null;
    let closest: { unit: CyberPoliceUnit; distance: number } | null = null;
    CYBER_POLICE_UNITS.forEach((unit) => {
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, unit.lat, unit.lng);
      if (!closest || dist < closest.distance) {
        closest = { unit, distance: dist };
      }
    });
    return closest;
  }, [userLocation]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" /> Google Maps API • Radar de Fraudes em Tempo Real
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <Globe2 className="w-7 h-7 text-blue-400" /> Mapa de Golpes & Unidades Cibernéticas
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Descubra os principais focos de golpes eletrônicos em sua região, consulte ocorrências próximas com base na sua <strong>Geolocalização</strong>, rastreie o <strong>DDD</strong> do estelionatário e localize a <strong>Delegacia Cibernética (DCCIBER / DEIC)</strong> mais próxima.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleLocateUser}
              disabled={isLocating}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <LocateFixed className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
              <span>{isLocating ? "Localizando..." : "Ver Minha Região (GPS)"}</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Reportar Golpe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nearest Cyber Police Alert Bar if User Location is active */}
      {nearestPoliceUnit && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-white animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Sua Delegacia Cibernética de Jurisdição Mais Próxima
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px]">
                  a ~{nearestPoliceUnit.distance} km de você
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-100">{nearestPoliceUnit.unit.name}</h3>
              <p className="text-xs text-slate-400">{nearestPoliceUnit.unit.address} • Tel: {nearestPoliceUnit.unit.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => handleSelectPolice(nearestPoliceUnit.unit)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all whitespace-nowrap"
            >
              Ver no Mapa
            </button>
            <a
              href={nearestPoliceUnit.unit.onlineBoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
            >
              <span>Abrir B.O. Online</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Quick Region Selector Pills */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Navegação Rápida por Região do Brasil:
          </span>
          {userLocation && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800">
              <LocateFixed className="w-3.5 h-3.5" />
              <span>Sua posição identificada: {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {BRAZIL_REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => handleRegionSelect(region)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-600 hover:border-blue-300"
            >
              {region.name}
            </button>
          ))}
        </div>
      </div>

      {/* DDD Search Bar & Proximity Distance Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DDD / Phone Origin Tracker */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Rastreador de DDD do Golpista
            </h2>
            {dddSearch && (
              <button
                onClick={() => handleDddSearch("")}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              value={dddSearch}
              onChange={(e) => handleDddSearch(e.target.value)}
              placeholder="Digite o DDD do número (Ex: 11, 21, 61, 91...)"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {dddResult && (
            <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 animate-fade-in text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  DDD ({dddResult.ddd}) • {dddResult.stateName}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded font-bold">
                  {dddResult.region}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                <strong>Principais golpes operados:</strong> {dddResult.mainScams.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Proximity Radius Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Raio de Proximidade da Sua Região
            </h2>
            {userLocation && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> GPS Ativo
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setRadiusFilterKm(null)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                radiusFilterKm === null
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              Sem Limite (Brasil)
            </button>
            <button
              onClick={() => {
                if (!userLocation) handleLocateUser();
                setRadiusFilterKm(50);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                radiusFilterKm === 50
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              Até 50 km
            </button>
            <button
              onClick={() => {
                if (!userLocation) handleLocateUser();
                setRadiusFilterKm(150);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                radiusFilterKm === 150
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              Até 150 km
            </button>
            <button
              onClick={() => {
                if (!userLocation) handleLocateUser();
                setRadiusFilterKm(500);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                radiusFilterKm === 500
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              Até 500 km
            </button>
          </div>

          {locationError && (
            <p className="text-[11px] text-red-500 font-medium">{locationError}</p>
          )}
        </div>
      </div>

      {/* Filter Tabs & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === "all"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Todos ({filteredIncidents.length + filteredPolice.length})
          </button>
          <button
            onClick={() => setFilterType("scams")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === "scams"
                ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Alertas de Golpes ({filteredIncidents.length})
          </button>
          <button
            onClick={() => setFilterType("police")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === "police"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-500" /> Delegacias Cibernéticas ({filteredPolice.length})
          </button>
        </div>

        <button
          onClick={() => setShowKeyConfig(!showKeyConfig)}
          className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-blue-500 flex items-center gap-1"
        >
          <Key className="w-3 h-3" />
          <span>Configuração de Chave do Google Maps</span>
        </button>
      </div>

      {/* Optional Google Maps API Key Config Box */}
      {showKeyConfig && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-blue-500" /> Chave de API Google Maps Platform
            </span>
            <button onClick={() => setShowKeyConfig(false)} className="text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-[11px]">
            Para renderização completa de camadas e satélite com o Google Maps JavaScript API, insira sua chave gratuita de demonstração (Demo Key) ou configure a variável <code>VITE_GOOGLE_MAPS_API_KEY</code>.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customApiKey}
              onChange={(e) => {
                setCustomApiKey(e.target.value);
                localStorage.setItem("gmaps_api_key", e.target.value);
              }}
              placeholder="Cole sua API Key do Google Maps aqui..."
              className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <a
              href="https://mapsplatform.google.com/maps-demo-key"
              target="_blank"
              rel="noreferrer noopener"
              className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold text-[11px] flex items-center gap-1 whitespace-nowrap"
            >
              <span>Gerar Demo Key Grátis</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Main Map & Incident Stream Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Google Map Viewport */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
            {effectiveApiKey ? (
              <APIProvider apiKey={effectiveApiKey}>
                <Map
                  mapId="DEMO_MAP_ID"
                  defaultCenter={mapCenter}
                  defaultZoom={mapZoom}
                  internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                  className="w-full h-full"
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                >
                  <MapCameraController center={mapCenter} zoom={mapZoom} />

                  {/* Top-Right GPS Quick Control on Map */}
                  <MapControl position={ControlPosition.TOP_RIGHT}>
                    <button
                      onClick={handleLocateUser}
                      className="m-2.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold text-xs shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                    >
                      <LocateFixed className="w-4 h-4 text-blue-600" />
                      <span>Minha Região</span>
                    </button>
                  </MapControl>

                  {/* User Location Pulse Marker */}
                  {userLocation && (
                    <AdvancedMarker
                      position={{ lat: userLocation.lat, lng: userLocation.lng }}
                      title="Sua Localização Atual"
                    >
                      <Pin
                        background="#2563eb"
                        borderColor="#1d4ed8"
                        glyphColor="#ffffff"
                        scale={1.3}
                      />
                    </AdvancedMarker>
                  )}

                  {/* Scam Incident Markers */}
                  {filteredIncidents.map((inc) => (
                    <AdvancedMarker
                      key={inc.id}
                      position={{ lat: inc.lat, lng: inc.lng }}
                      onClick={() => handleSelectIncident(inc)}
                      title={inc.title}
                    >
                      <Pin
                        background="#dc2626"
                        borderColor="#7f1d1d"
                        glyphColor="#ffffff"
                        scale={selectedIncident?.id === inc.id ? 1.4 : 1.0}
                      />
                    </AdvancedMarker>
                  ))}

                  {/* Cyber Police Station Markers */}
                  {filteredPolice.map((unit) => (
                    <AdvancedMarker
                      key={unit.id}
                      position={{ lat: unit.lat, lng: unit.lng }}
                      onClick={() => handleSelectPolice(unit)}
                      title={unit.name}
                    >
                      <Pin
                        background="#059669"
                        borderColor="#064e3b"
                        glyphColor="#ffffff"
                        scale={selectedPolice?.id === unit.id ? 1.4 : 1.0}
                      />
                    </AdvancedMarker>
                  ))}

                  {/* InfoWindow for Incident */}
                  {selectedIncident && (
                    <InfoWindow
                      position={{ lat: selectedIncident.lat, lng: selectedIncident.lng }}
                      onCloseClick={() => setSelectedIncident(null)}
                    >
                      <div className="p-2 max-w-xs text-slate-900">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase mb-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> {selectedIncident.category}
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mb-1 leading-snug">
                          {selectedIncident.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                          {selectedIncident.details}
                        </p>
                        <div className="flex items-center justify-between text-[10px] bg-slate-100 p-1.5 rounded font-mono">
                          <span>DDD ({selectedIncident.ddd}) • {selectedIncident.city}/{selectedIncident.state}</span>
                          <span className="font-bold text-red-600">{selectedIncident.reportedCount} denúncias</span>
                        </div>
                      </div>
                    </InfoWindow>
                  )}

                  {/* InfoWindow for Police */}
                  {selectedPolice && (
                    <InfoWindow
                      position={{ lat: selectedPolice.lat, lng: selectedPolice.lng }}
                      onCloseClick={() => setSelectedPolice(null)}
                    >
                      <div className="p-2 max-w-xs text-slate-900">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase mb-1">
                          <Building2 className="w-3.5 h-3.5" /> Delegacia Especializada
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mb-1 leading-snug">
                          {selectedPolice.name}
                        </h4>
                        <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                          {selectedPolice.address}
                        </p>
                        <a
                          href={selectedPolice.onlineBoUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]"
                        >
                          <span>Fazer B.O. Online</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              /* Fallback Interactive Radar Simulation when API Key is not yet configured */
              <div className="w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative">
                <div className="w-full flex items-center justify-between z-10">
                  <div className="flex items-center gap-2 bg-blue-900/60 border border-blue-500/40 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-200">
                    <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <span>Radar Geográfico Ativo (Brasil)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 bg-black/50 px-2.5 py-1 rounded-lg border border-slate-700">
                    {filteredIncidents.length} focos mapeados
                  </div>
                </div>

                {/* Simulated Brazil Interactive Grid */}
                <div className="w-full max-w-lg my-auto relative h-64 border border-blue-500/20 rounded-2xl bg-black/40 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent pointer-events-none animate-pulse"></div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-200">Focos de Fraude na Região:</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> {filteredPolice.length} Delegacias
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-44 py-1 pr-1">
                    {filteredIncidents.slice(0, 6).map((inc) => {
                      const dist = userLocation
                        ? calculateDistanceKm(userLocation.lat, userLocation.lng, inc.lat, inc.lng)
                        : null;
                      return (
                        <button
                          key={inc.id}
                          onClick={() => handleSelectIncident(inc)}
                          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all text-[11px] group cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-[10px] text-red-400 font-bold mb-0.5">
                            <span>{inc.city}/{inc.state}</span>
                            {dist !== null ? (
                              <span className="text-[9px] text-blue-400 font-mono">~{dist} km</span>
                            ) : (
                              <span className="text-[9px] bg-red-950 px-1 py-0.2 rounded border border-red-800">DDD {inc.ddd}</span>
                            )}
                          </div>
                          <div className="font-semibold text-slate-200 truncate group-hover:text-white">
                            {inc.category}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                    <span>💡 Clique em qualquer ponto para abrir o dossiê.</span>
                    <span className="font-mono text-blue-400">Coordenadas: {mapCenter.lat.toFixed(2)}, {mapCenter.lng.toFixed(2)}</span>
                  </div>
                </div>

                {/* API Key Instructions Prompt */}
                <div className="w-full bg-blue-950/80 border border-blue-500/30 rounded-xl p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300 text-[11px]">
                      Para habilitar o mapa vetorial completo do Google Maps, insira a Demo Key no botão acima.
                    </span>
                  </div>
                  <button
                    onClick={() => setShowKeyConfig(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] whitespace-nowrap"
                  >
                    Inserir Chave
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 px-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span> Alertas de Golpe
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span> Delegacias DCCIBER
              </span>
              {userLocation && (
                <span className="flex items-center gap-1.5 text-blue-500 font-bold">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> Você
                </span>
              )}
            </div>
            <span className="text-[11px]">Clique nos marcadores para detalhes</span>
          </div>
        </div>

        {/* Side Detail Card / Incident Stream */}
        <div className="space-y-4 flex flex-col">
          {/* Active Selection Details Card */}
          {selectedIncident ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border-2 border-red-500/40 shadow-md space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-black text-[10px] uppercase tracking-wider">
                  Alerta Regional de Golpe
                </span>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                {selectedIncident.title}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 text-[10px] block">Localidade</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedIncident.city}/{selectedIncident.state} (DDD {selectedIncident.ddd})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Prejuízo Médio</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {selectedIncident.avgLoss}
                  </span>
                </div>
              </div>

              {userLocation && (
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Distância da sua posição:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                    ~{calculateDistanceKm(userLocation.lat, userLocation.lng, selectedIncident.lat, selectedIncident.lng)} km
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Modo de Operação do Criminoso:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900">
                  {selectedIncident.suspectMethod}
                </p>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {selectedIncident.details}
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-700">
                <span>{selectedIncident.reportedCount} relatos</span>
                <span>{selectedIncident.date}</span>
              </div>
            </div>
          ) : selectedPolice ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border-2 border-emerald-500/40 shadow-md space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider">
                  Delegacia de Cibercrimes
                </span>
                <button
                  onClick={() => setSelectedPolice(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                {selectedPolice.name}
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{selectedPolice.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="font-mono">{selectedPolice.phone}</span>
                </div>
              </div>

              {userLocation && (
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Distância da sua posição:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ~{calculateDistanceKm(userLocation.lat, userLocation.lng, selectedPolice.lat, selectedPolice.lng)} km
                  </span>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                <strong className="text-slate-800 dark:text-slate-200 block text-[11px] mb-0.5">Especialidade / Foco:</strong>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  {selectedPolice.specialty}
                </p>
              </div>

              <a
                href={selectedPolice.onlineBoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>Registrar B.O. nesta Delegacia Online</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
              <MapPin className="w-8 h-8 text-blue-500 mx-auto" />
              <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                Selecione um Ponto no Radar
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Clique nos pins vermelhos para ver como os golpistas estão atuando em cada cidade ou nos pins verdes para obter o contato direto da Delegacia Cibernética.
              </p>
            </div>
          )}

          {/* List of Incidents / Cyber Units in Region */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 flex-1 flex flex-col space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>{filterType === "police" ? "Delegacias Cibernéticas" : "Ocorrências na Região"}</span>
              <span className="text-[10px] text-slate-500 font-normal">
                {userLocation ? "Ordenado por proximidade" : `${filteredIncidents.length} focos`}
              </span>
            </h4>

            <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
              {filterType !== "police" &&
                filteredIncidents.map((inc) => {
                  const dist = userLocation
                    ? calculateDistanceKm(userLocation.lat, userLocation.lng, inc.lat, inc.lng)
                    : null;
                  return (
                    <button
                      key={inc.id}
                      onClick={() => handleSelectIncident(inc)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all border text-xs cursor-pointer flex items-center justify-between ${
                        selectedIncident?.id === inc.id
                          ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold block truncate text-[11px]">{inc.title}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {inc.city}/{inc.state} • {inc.category}
                        </span>
                      </div>
                      {dist !== null ? (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded whitespace-nowrap">
                          ~{dist} km
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded flex-shrink-0">
                          DDD {inc.ddd}
                        </span>
                      )}
                    </button>
                  );
                })}

              {filterType === "police" &&
                filteredPolice.map((unit) => {
                  const dist = userLocation
                    ? calculateDistanceKm(userLocation.lat, userLocation.lng, unit.lat, unit.lng)
                    : null;
                  return (
                    <button
                      key={unit.id}
                      onClick={() => handleSelectPolice(unit)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all border text-xs cursor-pointer flex items-center justify-between ${
                        selectedPolice?.id === unit.id
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold block truncate text-[11px]">{unit.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {unit.city}/{unit.state} • {unit.phone}
                        </span>
                      </div>
                      {dist !== null ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded whitespace-nowrap">
                          ~{dist} km
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded flex-shrink-0">
                          B.O.
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Report New Incident */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-sm uppercase">
                <ShieldAlert className="w-5 h-5" /> Reportar Tentativa de Golpe no Mapa
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Golpe / Ocorrência *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Falso 0800 do Nubank por SMS pedindo cancelamento"
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Falsa Central Bancária (0800)">Falsa Central Bancária (0800)</option>
                    <option value="Golpe do WhatsApp / Novo Número">Golpe do WhatsApp / Novo Número</option>
                    <option value="Falso Rastreio Correios / Phishing">Falso Rastreio Correios / Phishing</option>
                    <option value="Falso Emprego / Tarefas Telegram">Falso Emprego / Tarefas Telegram</option>
                    <option value="Falso Leilão de Veículos">Falso Leilão de Veículos</option>
                    <option value="Golpe da Maquininha">Golpe da Maquininha</option>
                    <option value="Boleto Adulterado">Boleto Adulterado</option>
                    <option value="Outro Golpe">Outro Golpe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    DDD do Criminoso
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newDdd}
                    onChange={(e) => setNewDdd(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ex: 11, 21, 61, 91"
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Ex: São Paulo, Belém, etc."
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estado (UF)
                  </label>
                  <select
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {["SP", "RJ", "MG", "PR", "RS", "DF", "BA", "PA", "CE", "PE", "SC", "GO", "ES", "AM", "MT", "MS", "MA", "PB", "RN", "AL", "PI", "SE", "RO", "TO", "AC", "AP", "RR"].map(
                      (uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Valor Solicitado / Prejuízo (Opcional)
                </label>
                <input
                  type="text"
                  value={newAvgLoss}
                  onChange={(e) => setNewAvgLoss(e.target.value)}
                  placeholder="Ex: 1.500,00"
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detalhes do Golpe (Como o criminoso agiu)
                </label>
                <textarea
                  rows={3}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Descreva o texto da mensagem, número ou link usado para alertar a comunidade."
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Publicar Alerta no Mapa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
