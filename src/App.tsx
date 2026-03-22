import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Landmark, Swords, Map as MapIcon, Coins, 
  Shield, Activity, ChevronRight, Globe, 
  Scale, AlertTriangle, Gavel, Ban, Pillar
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

// --- Data ---
const mapLocations = [
  { 
    name: "Ρώμη", latinName: "Roma", lat: 41.9028, lng: 12.4964, type: "capital",
    desc: "Η Αιώνια Πόλη, πρωτεύουσα της αυτοκρατορίας και έδρα της Συγκλήτου και του Αυτοκράτορα.",
    pop: "~1.000.000"
  },
  { 
    name: "Αλεξάνδρεια", latinName: "Alexandria", lat: 31.2001, lng: 29.9187, type: "imperial",
    desc: "Ο σιτοβολώνας της Ρώμης. Προσωπική κτήση του Αυγούστου, διοικούμενη από έπαρχο ιππικής τάξης.",
    pop: "~500.000"
  },
  { 
    name: "Έφεσος", latinName: "Ephesus", lat: 37.9411, lng: 27.3419, type: "senatorial",
    desc: "Πρωτεύουσα της πλούσιας συγκλητικής επαρχίας της Ασίας. Σημαντικό εμπορικό και θρησκευτικό κέντρο.",
    pop: "~200.000"
  },
  { 
    name: "Καρχηδόνα", latinName: "Carthago", lat: 36.8528, lng: 10.3233, type: "senatorial",
    desc: "Ανοικοδομημένη από τον Ιούλιο Καίσαρα και τον Αύγουστο, αποτελεί το κέντρο της Αφρικής και βασικό εξαγωγέα σιτηρών.",
    pop: "~150.000"
  },
  { 
    name: "Λούγδουνο", latinName: "Lugdunum", lat: 45.7640, lng: 4.8357, type: "imperial",
    desc: "Πρωτεύουσα των Τριών Γαλατιών. Διαθέτει το μοναδικό αυτοκρατορικό νομισματοκοπείο εκτός Ρώμης.",
    pop: "~50.000"
  },
  { 
    name: "Τευτοβούργιος Δρυμός", latinName: "Clades Variana", lat: 52.4083, lng: 8.0461, type: "danger",
    desc: "Τόπος καταστροφής 3 ρωμαϊκών λεγεώνων (XVII, XVIII, XIX) υπό τον Βάρο από γερμανικά φύλα (9 μ.Χ.).",
    pop: "N/A"
  },
  { 
    name: "Αντιόχεια", latinName: "Antiochia", lat: 36.2021, lng: 36.1606, type: "imperial",
    desc: "Πρωτεύουσα της Συρίας, κρίσιμη στρατιωτική βάση για την άμυνα απέναντι στους Πάρθους.",
    pop: "~300.000"
  },
  { 
    name: "Αθήνα", latinName: "Athenae", lat: 37.9838, lng: 23.7275, type: "senatorial",
    desc: "Πολιτιστικό και εκπαιδευτικό κέντρο της αυτοκρατορίας, ανήκει στην ειρηνική επαρχία της Αχαΐας.",
    pop: "~30.000"
  },
  { 
    name: "Ταρρακώνα", latinName: "Tarraco", lat: 41.1189, lng: 1.2445, type: "imperial",
    desc: "Πρωτεύουσα της Hispania Tarraconensis. Ο Αύγουστος διέμεινε εδώ κατά τους Κανταβρικούς πολέμους.",
    pop: "~30.000"
  }
];

const getColor = (type: string) => {
  switch(type) {
    case 'capital': return '#7e22ce'; // Purple
    case 'imperial': return '#eab308'; // Yellow
    case 'senatorial': return '#3b82f6'; // Blue
    case 'danger': return '#dc2626'; // Red
    default: return '#64748b';
  }
};

const taxData: Record<string, any>[] = [
  { 
    name: 'Φορολογία (Ποσοστά %)', 
    'Φόρος Κληρονομιάς (Vicesima Hereditatium 5%)': 5, 
    'Φόρος Πλειστηριασμών (Centesima Rerum Venalium 1%)': 1 
  }
];

const militaryData = [
  { name: 'Λεγεωνάριοι', value: 150000 },
  { name: 'Επικουρικά Στρατεύματα (Auxilia)', value: 150000 },
  { name: 'Πραιτωριανή Φρουρά', value: 4500 },
];
const MILITARY_COLORS = ['#991b1b', '#ca8a04', '#1e293b'];

const coloniesList = [
  "Αποικία της Πάτρας (Colonia Augusta Achaica Patrensis)",
  "Αποικία των Φιλίππων (Colonia Iulia Augusta Philippensis)",
  "Αποικία του Δίου (Colonia Iulia Augusta Diensis)",
  "Αποικία της Αόστα (Colonia Augusta Praetoria Salassorum)",
  "Αποικία της Μέριδας (Colonia Augusta Emerita)",
  "Αποικία του Τορίνο (Colonia Iulia Augusta Taurinorum)",
  "Αποικία του Τριρ (Colonia Augusta Treverorum)",
  "Αποικία της Σινώπης (Colonia Iulia Augusta Sinope)",
  "...και 20 ακόμη στρατηγικές αποικίες."
];

type ViewType = 'overview' | 'economy' | 'military' | 'social' | 'greece';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('overview');

  const navItems = [
    { id: 'overview', icon: Globe, label: "Σύνοψη & Επαρχίες" },
    { id: 'economy', icon: Coins, label: "Οικονομία & Επισιτισμός" },
    { id: 'military', icon: Swords, label: "Στρατιωτική Δομή" },
    { id: 'social', icon: Scale, label: "Κοινωνική Μηχανική" },
    { id: 'greece', icon: Landmark, label: "Ελλαδικός Χώρος" },
  ];

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* System Alert */}
      <div className="bg-red-900 text-white p-4 rounded-xl flex items-start gap-4 shadow-lg border border-red-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-800 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
        <AlertTriangle className="w-8 h-8 text-yellow-500 shrink-0 animate-pulse" />
        <div className="relative z-10">
          <h4 className="font-bold font-serif text-lg tracking-wider text-yellow-500">
            CRITICAL ERROR: Απώλεια Λεγεώνων XVII, XVIII, XIX στον Τευτοβούργιο Δρυμό (9 μ.Χ.)
          </h4>
          <p className="text-sm font-mono text-red-200 mt-1 uppercase tracking-widest">
            Εντολή: Quintili Vare, legiones redde!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Massive Stat Card */}
        <div className="lg:col-span-3 bg-white border border-slate-200 shadow-lg rounded-xl p-8 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Coins className="w-64 h-64 text-red-800" />
          </div>
          <div className="relative z-10">
            <h2 className="text-red-800 font-serif text-lg uppercase tracking-widest mb-2 flex items-center gap-2">
              <Landmark className="w-5 h-5" />
              Δωρεές στο Ταμείο
            </h2>
            <div className="text-5xl md:text-7xl font-bold text-yellow-600 tracking-tighter drop-shadow-sm">
              600.000.000 <span className="text-3xl text-slate-400">Σηστέρτιοι</span>
            </div>
            <p className="text-slate-600 mt-4 max-w-3xl text-lg font-medium">
              Μεταφορά από το προσωπικό ταμείο (fiscus) στο δημόσιο ταμείο (aerarium) για την εξασφάλιση της πολιτικής σταθερότητας.
            </p>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="lg:col-span-3 bg-white border border-slate-200 shadow-lg rounded-xl p-6 flex flex-col h-[600px]">
          <h3 className="text-red-800 font-serif text-lg uppercase tracking-widest mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Χάρτης Επαρχιών (Η Θάλασσά Μας - Mare Nostrum)
          </h3>
          <div className="flex-1 relative bg-[#a5c3d1] rounded-lg border border-slate-200 overflow-hidden z-0">
            {/* Legend */}
            <div className="absolute bottom-6 left-6 z-[400] bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg border border-slate-200 pointer-events-none">
              <h4 className="font-serif font-bold text-sm text-slate-800 mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">Υπομνημα</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-600 border border-white shadow-sm" /> <span className="text-slate-700 font-medium">Πρωτεύουσα</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 border border-white shadow-sm" /> <span className="text-slate-700 font-medium">Αυτοκρατορική Επαρχία</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm" /> <span className="text-slate-700 font-medium">Συγκλητική Επαρχία</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-sm" /> <span className="text-slate-700 font-medium">Εμπόλεμη Ζώνη</span></div>
              </div>
            </div>

            <MapContainer 
              center={[40.0, 15.0]} 
              zoom={4} 
              scrollWheelZoom={true} 
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              {mapLocations.map((loc, idx) => (
                <CircleMarker 
                  key={idx}
                  center={[loc.lat, loc.lng]}
                  radius={9}
                  pathOptions={{ 
                    color: 'white', 
                    weight: 2, 
                    fillColor: getColor(loc.type), 
                    fillOpacity: 1 
                  }}
                >
                  <Tooltip 
                    direction="top" 
                    offset={[0, -10]} 
                    opacity={1} 
                    className="font-bold border shadow-sm bg-white/90 text-slate-800 border-slate-200"
                  >
                    {loc.name}
                  </Tooltip>
                  <Popup>
                    <div className="p-1 min-w-[220px]">
                      <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: getColor(loc.type) }} />
                        <h4 className="font-serif font-bold text-lg text-slate-900 m-0 leading-none">{loc.name}</h4>
                      </div>
                      <p className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-wider">{loc.latinName}</p>
                      <p className="text-sm text-slate-700 leading-relaxed mb-3">{loc.desc}</p>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Πληθυσμος</span>
                        <span className="text-sm font-mono font-bold text-slate-800">{loc.pop}</span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEconomy = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-serif font-bold text-slate-900 border-b border-slate-200 pb-4">
        Οικονομία & Επισιτισμός
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-8 border-t-4 border-t-yellow-500">
          <h3 className="text-red-800 font-serif text-2xl mb-4 flex items-center gap-3">
            <Activity className="w-7 h-7" />
            Μέριμνα Σιτηρών (Cura Annonae)
          </h3>
          <p className="text-slate-700 leading-relaxed text-lg">
            Δωρεάν διανομή σιτηρών σε <strong>200.000 πολίτες</strong> της Ρώμης. Ο Αύγουστος χρησιμοποίησε την Αίγυπτο ως προσωπικό σιτοβολώνα για να ελέγχει τον πληθυσμό, αναθέτοντας τη διοίκησή της αποκλειστικά στον <em>Έπαρχο της Αιγύπτου (Praefectus Aegypti)</em> (ιππικής τάξης), απαγορεύοντας την είσοδο σε συγκλητικούς.
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-8 h-[400px] flex flex-col">
          <h3 className="text-red-800 font-serif text-lg uppercase tracking-widest mb-6">
            Στρατιωτικό Ταμείο (Aerarium Militare) (6 μ.Χ.)
          </h3>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taxData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 6]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Φόρος Κληρονομιάς (Vicesima Hereditatium 5%)" fill="#991b1b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Φόρος Πλειστηριασμών (Centesima Rerum Venalium 1%)" fill="#ca8a04" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMilitary = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-serif font-bold text-slate-900 border-b border-slate-200 pb-4">
        Στρατιωτική Δομή
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-6 h-[500px] flex flex-col items-center">
          <h3 className="text-red-800 font-serif text-lg uppercase tracking-widest mb-2 w-full text-left">
            Μόνιμος Αυτοκρατορικός Στρατός
          </h3>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={militaryData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {militaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MILITARY_COLORS[index % MILITARY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString()}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-8 border-t-4 border-t-slate-800 flex flex-col">
          <h3 className="text-slate-800 font-serif text-2xl mb-6 flex items-center gap-3">
            <MapIcon className="w-7 h-7" />
            Νέες Αποικίες Βετεράνων (28 συνολικά)
          </h3>
          <p className="text-slate-600 mb-6 italic">
            Η εγκατάσταση βετεράνων σε στρατηγικά σημεία της αυτοκρατορίας εξασφάλιζε τον εκρωμαϊσμό των επαρχιών και την άμεση καταστολή εξεγέρσεων.
          </p>
          <ul className="space-y-3 flex-1 overflow-y-auto pr-4">
            {coloniesList.map((colony, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-700">
                <Shield className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <span className="font-medium">{colony}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSocial = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-serif font-bold text-slate-900 border-b border-slate-200 pb-4">
        Firewall Ηθικής: Ιούλιοι Νόμοι (Leges Juliae)
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-8 hover:-translate-y-1 transition-transform duration-300 border-t-4 border-t-red-800">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
            <Scale className="w-7 h-7 text-red-800" />
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">
            Ιούλιος Νόμος περί Γάμου (Lex Julia de maritandis ordinibus)
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Επιβολή υποχρεωτικού γάμου και τεκνοποίησης. Προβλέπονταν αυστηρές οικονομικές και κοινωνικές ποινές σε άγαμους (caelibes) και άτεκνους, ενώ δίνονταν προνόμια, το δικαίωμα των τριών τέκνων (ius trium liberorum), σε πολύτεκνους.
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-8 hover:-translate-y-1 transition-transform duration-300 border-t-4 border-t-yellow-500">
          <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mb-6 border border-yellow-100">
            <Gavel className="w-7 h-7 text-yellow-600" />
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">
            Ιούλιος Νόμος περί Μοιχείας (Lex Julia de adulteriis)
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Η μοιχεία μετατράπηκε από ιδιωτικό σε δημόσιο έγκλημα. Το κράτος παρενέβαινε πλέον στην οικογενειακή ζωή. Ο πατέρας αποκτούσε το δικαίωμα να σκοτώσει την κόρη του και τον εραστή της αν τους έπιανε επ' αυτοφώρω.
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-8 hover:-translate-y-1 transition-transform duration-300 border-t-4 border-t-slate-800">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-6 border border-slate-200">
            <Ban className="w-7 h-7 text-slate-800" />
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">
            Απαγορεύσεις Συστήματος (Εξορίες)
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Ο Αύγουστος εφάρμοσε τους νόμους του με απόλυτη αυστηρότητα, εξορίζοντας την ίδια του την κόρη, Ιουλία (στο νησί Πανδατερία), και αργότερα τον διάσημο ποιητή Οβίδιο (στην Τόμις της Μαύρης Θάλασσας) για ηθικά παραπτώματα.
          </p>
        </div>
      </div>
    </div>
  );

  const renderGreece = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-serif font-bold text-slate-900 border-b border-slate-200 pb-4">
        Ενσωμάτωση Επαρχίας της Αχαΐας (Provincia Achaea)
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-8 hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-6 border border-red-100">
            <Landmark className="w-6 h-6 text-red-800" />
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">
            Διοικητική Αναδιάρθρωση
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Διαχωρισμός της Αχαΐας από τη Μακεδονία το 27 π.Χ. Ορίστηκε ως Συγκλητική επαρχία (ειρηνική, χωρίς σταθμευμένες λεγεώνες) με πρωτεύουσα την Κόρινθο, η οποία αναδείχθηκε σε διοικητικό κέντρο.
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-8 hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-6 border border-yellow-100">
            <Shield className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">
            Νικόπολη: Η Πόλη της Νίκης
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Ίδρυση το 29 π.Χ. σε ανάμνηση της ναυμαχίας του Ακτίου. Έλαβε το προνομιακό καθεστώς της ελεύθερης πόλης (civitas libera). Στο Μνημείο του Αυγούστου τοποθετήθηκαν 36 χάλκινα έμβολα από τα ηττημένα πλοία του Αντωνίου.
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-8 hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6 border border-slate-200">
            <Coins className="w-6 h-6 text-slate-800" />
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">
            Αποικία της Πάτρας (Colonia Augusta Achaica Patrensis)
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Η Πάτρα ιδρύθηκε ως ρωμαϊκή αποικία. Πραγματοποιήθηκε μαζική εγκατάσταση βετεράνων της 10ης και 12ης Λεγεώνας. Μετατράπηκε ταχύτατα σε τεράστιο εμπορικό, ναυτιλιακό και βιοτεχνικό κόμβο της αυτοκρατορίας.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-800" />
          <span className="font-serif font-bold text-xl text-red-800 tracking-wider">ΑΥΤΟΚΡΑΤΟΡΙΑ</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-red-50 text-red-800 border border-red-100 shadow-sm' 
                  : 'text-slate-600 hover:bg-red-50 hover:text-red-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {activeView === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400 font-serif tracking-widest">Η ΣΥΓΚΛΗΤΟΣ ΚΑΙ Ο ΛΑΟΣ ΤΗΣ ΡΩΜΗΣ (SPQR)</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-wide">
              ΛΕΙΤΟΥΡΓΙΚΟ ΣΥΣΤΗΜΑ ΗΓΕΜΟΝΑ: ΡΩΜΑΪΚΗ ΕΙΡΗΝΗ
            </h1>
            <p className="text-slate-500 text-sm mt-1">Σύστημα Διαχείρισης Αυτοκρατορίας</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full shadow-sm">
              <Activity className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-bold text-yellow-700 tracking-widest">SPQR</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeView === 'overview' && renderOverview()}
          {activeView === 'economy' && renderEconomy()}
          {activeView === 'military' && renderMilitary()}
          {activeView === 'social' && renderSocial()}
          {activeView === 'greece' && renderGreece()}
        </main>
      </div>
    </div>
  );
}
