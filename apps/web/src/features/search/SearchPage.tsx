import { useState } from 'react';
import { Search as SearchIcon, User, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router';

// Mock data to visualize UI before connecting API
const MOCK_DOCTORS = [
  { id: '1', name: 'Dr. Rahul Patel', spec: 'Cardiologist', dept: 'Cardiology', status: 'AVAILABLE', room: '101' },
  { id: '2', name: 'Dr. Sarah Smith', spec: 'Neurologist', dept: 'Neurology', status: 'IN_SURGERY', room: '204' },
  { id: '3', name: 'Dr. Amit Shah', spec: 'Orthopedic', dept: 'Orthopedics', status: 'ON_LEAVE', room: '105' },
];

export function SearchPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filteredDoctors = MOCK_DOCTORS.filter(d => 
    d.name.toLowerCase().includes(query.toLowerCase()) || 
    d.spec.toLowerCase().includes(query.toLowerCase()) ||
    d.dept.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Directory Search</h1>
        <p className="text-muted-foreground mt-1">Find doctors, departments, and services.</p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <input 
          type="text" 
          placeholder="Search for e.g., 'Cardiology' or 'Dr. Patel'..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-lg"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Results</h2>
        {filteredDoctors.length === 0 ? (
          <p className="text-muted-foreground">No results found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredDoctors.map(doc => (
              <div key={doc.id} className="p-4 border rounded-xl bg-card flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{doc.name}</h3>
                    <p className="text-muted-foreground">{doc.spec} • {doc.dept}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                        doc.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                        doc.status === 'IN_SURGERY' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          doc.status === 'AVAILABLE' ? 'bg-green-500' :
                          doc.status === 'IN_SURGERY' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`} />
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    Room {doc.room}
                  </div>
                  <button 
                    onClick={() => navigate(`/navigate?to=room_${doc.room}`)}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    Navigate Here
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
