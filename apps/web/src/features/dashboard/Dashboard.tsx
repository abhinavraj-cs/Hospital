import { useNavigate } from 'react-router';
import { MapPin, Search as SearchIcon, QrCode, AlertTriangle, Activity, Calendar, UserRound } from 'lucide-react';
import { useAuthStore } from '../auth/authStore';
import { motion, Variants } from 'framer-motion';
import { AdminDashboard } from '../admin/AdminDashboard';
import { DoctorDashboard } from '../doctors/DoctorDashboard';
import { PatientDashboard } from '../patient/PatientDashboard';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Route to role-specific dashboards
  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') return <AdminDashboard />;
  if (user?.role === 'DOCTOR') return <DoctorDashboard />;
  if (user?.role === 'PATIENT') return <PatientDashboard />;


  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
  };

  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="clinical-header-gradient p-8 rounded-[20px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
            {user ? `Welcome, ${user.name}` : 'Welcome to CityCare'}
          </h1>
          <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
            Manage your hospital visit effortlessly. Find your way, check doctor availability, and monitor your queues.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-700">Systems Online</span>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.button 
          variants={item}
          onClick={() => navigate('/navigate')}
          className="clinical-card flex flex-col items-start p-6 text-left group"
        >
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl mb-5 group-hover:scale-110 transition-transform">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1">Indoor Map</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Navigate the hospital campus with turn-by-turn directions.</p>
        </motion.button>

        <motion.button 
          variants={item}
          onClick={() => navigate('/search')}
          className="clinical-card flex flex-col items-start p-6 text-left group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-5 group-hover:scale-110 transition-transform">
            <SearchIcon className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1">Directory</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Search for doctors, view their schedules and book consultations.</p>
        </motion.button>

        <motion.button 
          variants={item}
          onClick={() => navigate('/scan')}
          className="clinical-card flex flex-col items-start p-6 text-left group"
        >
          <div className="p-3 bg-fuchsia-50 text-fuchsia-600 rounded-xl mb-5 group-hover:scale-110 transition-transform">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1">Scan Location</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Scan a wall QR code to instantly update your map position.</p>
        </motion.button>

        <motion.button 
          variants={item}
          onClick={() => navigate('/emergency')}
          className="clinical-card flex flex-col items-start p-6 text-left group border-red-100 hover:border-red-200"
        >
          <div className="p-3 bg-red-50 text-red-600 rounded-xl mb-5 group-hover:scale-110 transition-transform">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg text-red-600 mb-1">Emergency</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Quickest priority routing to the nearest Emergency Room.</p>
        </motion.button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid gap-6 md:grid-cols-12 mt-4"
      >
        <div className="md:col-span-8 bg-white border rounded-[20px] shadow-sm p-7">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <Activity className="h-5 w-5 text-sky-500" />
            <h3 className="font-semibold text-lg text-slate-900">Active Consultations</h3>
          </div>
          
          {!user ? (
            <div className="text-center py-10">
              <UserRound className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 mb-5">Please sign in to view your live queue status.</p>
              <button 
                onClick={() => navigate('/login')}
                className="bg-sky-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-sky-600 transition-colors shadow-sm"
              >
                Sign In securely
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-xl p-5 hover:border-sky-200 transition-colors bg-slate-50/50">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                      RP
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Dr. Rahul Patel</h4>
                      <p className="text-sm text-slate-500">Cardiology • Room 101</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 bg-white p-3 rounded-lg border shadow-sm">
                    <div className="text-center px-3">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Your Token</p>
                      <p className="text-2xl font-bold text-slate-900">20</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="text-center px-3">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Current</p>
                      <p className="text-xl font-semibold text-sky-600">15</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="text-center px-3">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Est. Wait</p>
                      <p className="text-xl font-semibold text-amber-500">~60m</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="md:col-span-4 bg-white border rounded-[20px] shadow-sm p-7">
           <div className="flex items-center gap-3 mb-6 pb-4 border-b">
             <Calendar className="h-5 w-5 text-sky-500" />
             <h3 className="font-semibold text-lg text-slate-900">Announcements</h3>
           </div>
           
           <div className="space-y-5">
             <div className="group">
               <p className="font-medium text-slate-900 mb-1 group-hover:text-sky-600 transition-colors cursor-pointer">Free Eye Checkup Camp</p>
               <p className="text-slate-500 text-sm leading-relaxed">This Sunday in the main auditorium. Open for all registered patients.</p>
             </div>
             <div className="group">
               <p className="font-medium text-slate-900 mb-1 group-hover:text-sky-600 transition-colors cursor-pointer">New MRI Facility</p>
               <p className="text-slate-500 text-sm leading-relaxed">Radiology department is now equipped with a state-of-the-art 3T MRI.</p>
             </div>
             <div className="group">
               <p className="font-medium text-slate-900 mb-1 group-hover:text-sky-600 transition-colors cursor-pointer">Visitor Hours Update</p>
               <p className="text-slate-500 text-sm leading-relaxed">Evening visitor hours extended to 8:00 PM starting this Monday.</p>
             </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
