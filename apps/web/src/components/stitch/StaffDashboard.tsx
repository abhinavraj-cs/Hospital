import React from 'react';

export function StaffDashboard() {
  return (
    <>
      
{/* SideNavBar (Web Only) */}
<aside className="hidden md:flex flex-col h-full py-lg bg-surface-container-lowest border-r border-outline-variant docked left-0 h-full w-64 z-20">
<div className="px-md mb-lg">
<h2 className="font-headline-lg text-headline-lg font-bold text-primary">CareNav</h2>
</div>
<div className="px-md mb-lg flex items-center gap-md">
<img alt="Staff Profile" className="w-12 h-12 rounded-full object-cover border border-outline-variant" data-alt="A professional headshot of a hospital administrator in a clinical setting, wearing formal business attire with a subtle medical ID badge. Clean, bright, and sterile lighting suitable for a modern hospital environment. Professional, trustworthy, and calm expression." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDUnZCy5Ztp0yH72nGCJRbI_JMoX7oPtGEcHubsQj1IRkTcaS6QwR6FS_jPGTrAIQGLKABfSZphTMlFtvIUEkQx7-exNnjfPooLujwI13w9TURK15CH6Cw5jzNnWv4LaBPQbqJ4MQsMamlhQ1GowiPCaSY3uXruEhKGAzLfos6hiztJbcEGPvjn6ZYK5uQpD-NMJCXcRR4vAAY3WQ4hQpP_dx4nBbms8Zp-rrWiDwtQvmJfEbKmytz" />
<div>
<p className="font-title-md text-title-md text-on-background">Admin Console</p>
<p className="font-label-md text-label-md text-on-surface-variant">Staff Access Only</p>
</div>
</div>
<nav className="flex-1 flex flex-col gap-sm px-sm">
<a className="flex items-center gap-md px-md py-sm rounded-lg text-primary font-bold border-l-4 border-primary bg-surface-container-high transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined filled-icon">clinical_notes</span>
<span className="font-label-lg text-label-lg">Operations</span>
</a>
<a className="flex items-center gap-md px-4 py-2 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 ease-in-out" href="{{DATA:SCREEN:SCREEN_2}}">
<span className="material-symbols-outlined">map</span>
<span className="font-label-lg text-label-lg">Map Editor</span>
</a>
<a className="flex items-center gap-md px-4 py-2 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined">insights</span>
<span className="font-label-lg text-label-lg">Analytics</span>
</a>
<a className="flex items-center gap-md px-4 py-2 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined">emergency_home</span>
<span className="font-label-lg text-label-lg">Emergency</span>
</a>
</nav>
<div className="px-md mt-auto mb-lg">
<button className="w-full bg-error text-on-error font-label-lg text-label-lg h-touch-target rounded-lg flex items-center justify-center gap-sm active:scale-95 transition-all">
<span className="material-symbols-outlined filled-icon">warning</span>
                Code Blue Alert
            </button>
</div>
<div className="px-md flex flex-col gap-sm">
<a className="flex items-center gap-md px-sm py-sm text-on-surface-variant hover:bg-surface-container-high rounded transition-all" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-label-md text-label-md">Settings</span>
</a>
<a className="flex items-center gap-md px-sm py-sm text-on-surface-variant hover:bg-surface-container-high rounded transition-all" href="#">
<span className="material-symbols-outlined">help</span>
<span className="font-label-md text-label-md">Help</span>
</a>
</div>
</aside>
{/* Main Content Area */}
<main className="flex-1 flex flex-col h-full overflow-hidden">
{/* TopAppBar */}
<header className="flex justify-between items-center px-margin-mobile w-full h-touch-target bg-surface border-b border-outline-variant docked full-width top-0 z-10 shrink-0 md:px-margin-desktop">
<div className="flex items-center gap-md md:hidden">
<span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">CareNav</span>
</div>
<div className="hidden md:flex items-center">
{/* Empty for alignment when sidebar is present */}
</div>
<div className="flex items-center gap-lg">
<div className="flex gap-sm">
<button className="text-primary font-bold border-b-2 border-primary pb-1 font-label-lg text-label-lg hover:bg-surface-container-low transition-colors scale-95 active:opacity-80">EN</button>
<button className="text-on-surface-variant font-medium pb-1 font-label-lg text-label-lg hover:bg-surface-container-low transition-colors scale-95 active:opacity-80">HI</button>
<button className="text-on-surface-variant font-medium pb-1 font-label-lg text-label-lg hover:bg-surface-container-low transition-colors scale-95 active:opacity-80">GU</button>
</div>
<div className="font-label-lg text-label-lg text-on-surface-variant hidden sm:block border-l border-outline-variant pl-lg">
                    ArogyaMitra Govt Hospital
                </div>
</div>
</header>
{/* Dashboard Content */}
<div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
<div className="max-w-7xl mx-auto space-y-lg">
{/* Metrics Grid */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-md">
{/* Metric Card 1 */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex flex-col justify-between h-32">
<div className="flex justify-between items-start">
<span className="font-label-lg text-label-lg text-on-surface-variant">Available Beds</span>
<span className="material-symbols-outlined text-secondary">bed</span>
</div>
<div className="flex items-baseline gap-sm">
<span className="font-display-lg text-display-lg text-primary">42</span>
<span className="font-label-md text-label-md text-on-surface-variant">/ 350 Total</span>
</div>
</div>
{/* Metric Card 2 */}
<div className="bg-error-container border border-error rounded-lg p-md flex flex-col justify-between h-32">
<div className="flex justify-between items-start">
<span className="font-label-lg text-label-lg text-on-error-container">Avg ER Wait</span>
<span className="material-symbols-outlined text-error">timer</span>
</div>
<div className="flex items-baseline gap-sm">
<span className="font-display-lg text-display-lg text-on-error-container">145<span className="text-xl">m</span></span>
<span className="font-label-md text-label-md text-error flex items-center"><span className="material-symbols-outlined text-sm">trending_up</span> +15m</span>
</div>
</div>
{/* Metric Card 3 */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex flex-col justify-between h-32">
<div className="flex justify-between items-start">
<span className="font-label-lg text-label-lg text-on-surface-variant">Discharges Today</span>
<span className="material-symbols-outlined text-secondary">logout</span>
</div>
<div className="flex items-baseline gap-sm">
<span className="font-display-lg text-display-lg text-primary">87</span>
<span className="font-label-md text-label-md text-on-surface-variant">Expected: 110</span>
</div>
</div>
</div>
{/* Bento Grid Layout for Main Areas */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
{/* Live Department Congestion (Spans 2 columns) */}
<div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-md">
<div className="flex justify-between items-center border-b border-outline-variant pb-sm">
<h3 className="font-title-md text-title-md text-on-background">Live Department Congestion</h3>
<button className="text-secondary font-label-md text-label-md flex items-center gap-xs hover:bg-surface-container p-1 rounded transition-colors">
<span className="material-symbols-outlined text-sm">refresh</span> Refresh
                            </button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-md flex-1">
{/* Congestion List */}
<div className="flex flex-col gap-sm">
{/* Item */}
<div className="flex items-center justify-between p-sm border border-error rounded-lg bg-error-container/20">
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-error"></div>
<span className="font-label-lg text-label-lg text-on-background">Emergency Dept</span>
</div>
<span className="font-title-md text-title-md text-error font-bold">145m</span>
</div>
{/* Item */}
<div className="flex items-center justify-between p-sm border border-outline-variant rounded-lg">
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-secondary-container"></div>
<span className="font-label-lg text-label-lg text-on-background">Pharmacy</span>
</div>
<span className="font-title-md text-title-md text-on-surface-variant">12m</span>
</div>
{/* Item */}
<div className="flex items-center justify-between p-sm border border-tertiary-fixed-dim rounded-lg bg-tertiary-fixed/30">
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-tertiary-container"></div>
<span className="font-label-lg text-label-lg text-on-background">Radiology</span>
</div>
<span className="font-title-md text-title-md text-on-tertiary-fixed-variant">45m</span>
</div>
{/* Item */}
<div className="flex items-center justify-between p-sm border border-outline-variant rounded-lg">
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-secondary-container"></div>
<span className="font-label-lg text-label-lg text-on-background">Outpatient Clinic</span>
</div>
<span className="font-title-md text-title-md text-on-surface-variant">18m</span>
</div>
</div>
{/* Simplified Map View */}
<div className="relative bg-surface-container rounded-lg border border-outline-variant flex items-center justify-center min-h-[200px] overflow-hidden">
<div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c4c6cf 0, #c4c6cf 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}></div>
<span className="font-label-lg text-label-lg text-outline z-10 flex flex-col items-center gap-sm">
<span className="material-symbols-outlined text-4xl">map</span>
                                    Floorplan Visualization Active
                                </span>
</div>
</div>
</div>
{/* Right Column: Alerts & Staff */}
<div className="flex flex-col gap-md">
{/* Active Alerts */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-md">
<h3 className="font-title-md text-title-md text-on-background border-b border-outline-variant pb-sm flex items-center gap-sm">
<span className="material-symbols-outlined text-error">campaign</span> Active Alerts
                            </h3>
<div className="flex flex-col gap-sm">
<div className="bg-error-container p-sm rounded-lg border border-error/50 border-l-4 border-l-error">
<p className="font-label-lg text-label-lg text-on-error-container font-bold mb-xs">ICU Capacity Critical</p>
<p className="font-label-md text-label-md text-on-error-container/80">ICU Ward 3 is at 98% capacity. Divert protocols recommended.</p>
</div>
<div className="bg-tertiary-fixed p-sm rounded-lg border border-tertiary-fixed-dim/50 border-l-4 border-l-on-tertiary-container">
<p className="font-label-lg text-label-lg text-on-tertiary-fixed font-bold mb-xs">Elevator B Maintenance</p>
<p className="font-label-md text-label-md text-on-tertiary-fixed-variant">Out of service until 14:00. Reroute patient transport.</p>
</div>
</div>
</div>
{/* On-Call Staff */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-md flex-1">
<h3 className="font-title-md text-title-md text-on-background border-b border-outline-variant pb-sm flex items-center gap-sm">
<span className="material-symbols-outlined text-secondary">medical_services</span> On-Call Chiefs
                            </h3>
<div className="flex flex-col">
{/* Staff Item */}
<div className="flex items-center gap-md py-sm border-b border-outline-variant">
<div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">SM</div>
<div>
<p className="font-label-lg text-label-lg text-on-background">Dr. Sarah Miller</p>
<p className="font-label-md text-label-md text-on-surface-variant">Surgery</p>
</div>
<button className="ml-auto text-secondary hover:bg-surface-container p-2 rounded-full transition-colors"><span className="material-symbols-outlined">call</span></button>
</div>
{/* Staff Item */}
<div className="flex items-center gap-md py-sm border-b border-outline-variant">
<div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">JD</div>
<div>
<p className="font-label-lg text-label-lg text-on-background">Dr. James Davis</p>
<p className="font-label-md text-label-md text-on-surface-variant">Cardiology</p>
</div>
<button className="ml-auto text-secondary hover:bg-surface-container p-2 rounded-full transition-colors"><span className="material-symbols-outlined">call</span></button>
</div>
{/* Staff Item */}
<div className="flex items-center gap-md py-sm">
<div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold">AK</div>
<div>
<p className="font-label-lg text-label-lg text-on-background">Dr. Aisha Khan</p>
<p className="font-label-md text-label-md text-on-surface-variant">Neurology</p>
</div>
<button className="ml-auto text-secondary hover:bg-surface-container p-2 rounded-full transition-colors"><span className="material-symbols-outlined">call</span></button>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
{/* BottomNavBar (Mobile Only) */}
<nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-surface border-t border-outline-variant docked full-width bottom-0 rounded-t-lg shadow-sm h-16">
<button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl p-2 w-16 active:scale-95 transition-transform">
<span className="material-symbols-outlined filled-icon">layers</span>
<span className="font-label-md text-label-md mt-1">Floor 1</span>
</button>
<button className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-16 hover:bg-surface-container active:scale-95 transition-transform">
<span className="material-symbols-outlined">layers</span>
<span className="font-label-md text-label-md mt-1">Floor 2</span>
</button>
<button className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-16 hover:bg-surface-container active:scale-95 transition-transform">
<span className="material-symbols-outlined">layers</span>
<span className="font-label-md text-label-md mt-1">Floor 3</span>
</button>
<button className="flex flex-col items-center justify-center text-error p-2 w-16 hover:bg-error-container/20 active:scale-95 transition-transform">
<span className="material-symbols-outlined">emergency</span>
<span className="font-label-md text-label-md mt-1">Emergency</span>
</button>
</nav>



    </>
  );
}
