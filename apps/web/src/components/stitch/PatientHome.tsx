import React from 'react';

export function PatientHome() {
  return (
    <>
      
{/* TopAppBar Mobile */}
<header className="md:hidden bg-surface text-primary flex justify-between items-center px-margin-mobile w-full h-touch-target docked full-width top-0 border-b border-outline-variant flat no shadows scale-95 active:opacity-80 transition-all z-50">
<div className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">CareNav</div>
<div className="flex items-center gap-sm">
<div className="flex gap-xs">
<span className="text-primary font-bold border-b-2 border-primary font-label-lg text-label-lg hover:bg-surface-container-low transition-colors cursor-pointer p-1">EN</span>
<span className="text-on-surface-variant font-medium font-label-lg text-label-lg hover:bg-surface-container-low transition-colors cursor-pointer p-1 active:bg-primary-container">HI</span>
<span className="text-on-surface-variant font-medium font-label-lg text-label-lg hover:bg-surface-container-low transition-colors cursor-pointer p-1 active:bg-primary-container">GU</span>
</div>
<span className="font-label-lg text-label-lg ml-md truncate max-w-[120px]">ArogyaMitra Govt Hospital</span>
</div>
</header>
{/* TopAppBar Desktop (Hybrid Nav) */}
<header className="hidden md:flex bg-surface text-primary justify-between items-center px-margin-desktop w-full h-touch-target docked full-width top-0 border-b border-outline-variant flat no shadows z-50">
<div className="flex items-center gap-lg">
<div className="font-headline-lg text-headline-lg font-bold text-primary mr-xl">CareNav</div>
<nav className="flex gap-md">
{/* Mapping bottom nav intents to top nav for desktop */}
<a className="text-primary font-bold border-b-2 border-primary font-label-lg text-label-lg py-2 hover:bg-surface-container-low transition-colors" href="#">Floor 1</a>
<a className="text-on-surface-variant font-medium font-label-lg text-label-lg py-2 hover:bg-surface-container-low transition-colors" href="#">Floor 2</a>
<a className="text-on-surface-variant font-medium font-label-lg text-label-lg py-2 hover:bg-surface-container-low transition-colors" href="#">Floor 3</a>
<a className="text-on-surface-variant font-medium font-label-lg text-label-lg py-2 hover:bg-surface-container-low transition-colors" href="#">Emergency</a>
</nav>
</div>
<div className="flex items-center gap-md">
<div className="flex gap-xs bg-surface-container-low rounded-lg p-1">
<button className="bg-primary text-on-primary font-label-md text-label-md px-2 py-1 rounded">EN</button>
<button className="text-on-surface-variant font-label-md text-label-md px-2 py-1 hover:bg-surface-variant rounded transition-colors">HI</button>
<button className="text-on-surface-variant font-label-md text-label-md px-2 py-1 hover:bg-surface-variant rounded transition-colors">GU</button>
</div>
<span className="font-label-lg text-label-lg text-on-surface-variant">ArogyaMitra Govt Hospital</span>
</div>
</header>
<main className="flex-grow flex flex-col md:flex-row pb-[80px] md:pb-0">
{/* Canvas Content */}
<div className="flex-grow p-margin-mobile md:p-margin-desktop flex flex-col gap-xl max-w-6xl mx-auto w-full">
{/* Search & Emergency Row */}
<section className="flex flex-col md:flex-row gap-md items-stretch">
<div className="flex-grow relative">
<label className="sr-only" htmlFor="main-search">Search Doctors, Departments, or Facilities</label>
<span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
<input className="w-full h-touch-target pl-xxl pr-sm border border-outline-variant bg-surface rounded-lg focus:border-primary focus:ring-1 focus:ring-primary font-body-lg text-body-lg text-on-surface placeholder:text-outline transition-colors outline-none" id="main-search" placeholder="Search Doctors, Departments..." type="text" />
</div>
<button className="h-touch-target bg-error text-on-error font-title-md text-title-md px-lg rounded-lg flex items-center justify-center gap-sm shadow-sm hover:bg-[#a31616] active:scale-95 transition-all whitespace-nowrap">
<span className="material-symbols-outlined" data-icon="emergency">emergency</span>
                    Emergency Assistance
                </button>
</section>
{/* Main Actions Bento Grid */}
<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
{/* Navigate */}
<button className="group flex flex-col items-start p-lg bg-surface border border-outline-variant rounded-xl hover:border-primary hover:shadow-sm transition-all active:scale-[0.98] text-left relative overflow-hidden min-h-[160px] cursor-pointer">
<div className="absolute right-[-20px] top-[-20px] opacity-10 bg-primary w-32 h-32 rounded-full blur-xl group-hover:opacity-20 transition-opacity"></div>
<span className="material-symbols-outlined text-[40px] text-primary mb-md" data-icon="navigation" data-weight="fill" style={{ fontVariationSettings: '\'FILL\' 1' }}>navigation</span>
<h3 className="font-title-md text-title-md text-on-surface mb-xs">Navigate</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Find your way to any department or room.</p>
</button>
{/* Find Doctor */}
<button className="group flex flex-col items-start p-lg bg-surface border border-outline-variant rounded-xl hover:border-primary hover:shadow-sm transition-all active:scale-[0.98] text-left relative overflow-hidden min-h-[160px] cursor-pointer">
<span className="material-symbols-outlined text-[40px] text-primary mb-md" data-icon="stethoscope">stethoscope</span>
<h3 className="font-title-md text-title-md text-on-surface mb-xs">Find Doctor</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Search specialists and view schedules.</p>
</button>
{/* Appointments */}
<button className="group flex flex-col items-start p-lg bg-surface border border-outline-variant rounded-xl hover:border-primary hover:shadow-sm transition-all active:scale-[0.98] text-left relative overflow-hidden min-h-[160px] cursor-pointer">
<span className="material-symbols-outlined text-[40px] text-primary mb-md" data-icon="calendar_today">calendar_today</span>
<h3 className="font-title-md text-title-md text-on-surface mb-xs">Appointments</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Check-in and view upcoming visits.</p>
</button>
{/* Scan Location */}
<button className="group flex flex-col items-start p-lg bg-primary text-on-primary border border-primary rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] text-left relative overflow-hidden min-h-[160px] cursor-pointer">
<span className="material-symbols-outlined text-[40px] mb-md" data-icon="qr_code_scanner">qr_code_scanner</span>
<h3 className="font-title-md text-title-md mb-xs">Scan Location</h3>
<p className="font-body-md text-body-md opacity-90">Scan a wall QR code to find your current location.</p>
</button>
</section>
{/* Nearby Facilities List */}
<section className="bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col">
<div className="p-md border-b border-outline-variant bg-surface-container-lowest">
<h2 className="font-title-md text-title-md text-on-surface">Nearby Facilities</h2>
</div>
<div className="flex flex-col divide-y divide-outline-variant">
<div className="p-md flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group">
<div className="flex items-center gap-md">
<div className="w-12 h-12 bg-secondary-fixed flex items-center justify-center rounded-lg text-on-secondary-fixed">
<span className="material-symbols-outlined" data-icon="local_pharmacy" data-weight="fill" style={{ fontVariationSettings: '\'FILL\' 1' }}>local_pharmacy</span>
</div>
<div>
<h4 className="font-title-md text-title-md text-on-surface">Main Pharmacy</h4>
<div className="flex gap-sm items-center mt-xs">
<span className="bg-surface-variant text-on-surface font-label-md text-label-md px-2 py-1 rounded">Floor 1</span>
<span className="font-body-md text-body-md text-on-surface-variant">50m away</span>
</div>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="chevron_right">chevron_right</span>
</div>
<div className="p-md flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group">
<div className="flex items-center gap-md">
<div className="w-12 h-12 bg-secondary-fixed flex items-center justify-center rounded-lg text-on-secondary-fixed">
<span className="material-symbols-outlined" data-icon="radiology">radiology</span>
</div>
<div>
<h4 className="font-title-md text-title-md text-on-surface">Radiology / X-Ray</h4>
<div className="flex gap-sm items-center mt-xs">
<span className="bg-surface-variant text-on-surface font-label-md text-label-md px-2 py-1 rounded">Floor 1</span>
<span className="font-body-md text-body-md text-on-surface-variant">120m away</span>
</div>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="chevron_right">chevron_right</span>
</div>
<div className="p-md flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group">
<div className="flex items-center gap-md">
<div className="w-12 h-12 bg-secondary-fixed flex items-center justify-center rounded-lg text-on-secondary-fixed">
<span className="material-symbols-outlined" data-icon="restaurant">restaurant</span>
</div>
<div>
<h4 className="font-title-md text-title-md text-on-surface">Cafeteria</h4>
<div className="flex gap-sm items-center mt-xs">
<span className="bg-surface-variant text-on-surface font-label-md text-label-md px-2 py-1 rounded">Floor 2</span>
<span className="font-body-md text-body-md text-on-surface-variant">Use West Elevator</span>
</div>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="chevron_right">chevron_right</span>
</div>
</div>
</section>
</div>
</main>
{/* BottomNavBar Mobile */}
<nav className="md:hidden bg-surface text-primary font-label-md text-label-md docked full-width bottom-0 rounded-t-lg border-t border-outline-variant shadow-sm fixed left-0 w-full z-50 flex justify-around items-center px-4 py-2">
<button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl p-2 min-w-[64px] active:scale-95 transition-transform hover:bg-surface-container">
<span className="material-symbols-outlined mb-1" data-icon="layers" data-weight="fill" style={{ fontVariationSettings: '\'FILL\' 1' }}>layers</span>
<span className="">Floor 1</span>
</button>
<button className="flex flex-col items-center justify-center text-on-surface-variant p-2 min-w-[64px] active:scale-95 transition-transform hover:bg-surface-container rounded-xl active:bg-primary-container">
<span className="material-symbols-outlined mb-1" data-icon="layers">layers</span>
<span className="">Floor 2</span>
</button>
<button className="flex flex-col items-center justify-center text-on-surface-variant p-2 min-w-[64px] active:scale-95 transition-transform hover:bg-surface-container rounded-xl active:bg-primary-container">
<span className="material-symbols-outlined mb-1" data-icon="layers">layers</span>
<span className="">Floor 3</span>
</button>
<button className="flex flex-col items-center justify-center text-on-surface-variant p-2 min-w-[64px] active:scale-95 transition-transform hover:bg-surface-container rounded-xl">
<span className="material-symbols-outlined mb-1 text-error" data-icon="emergency">emergency</span>
<span className="text-error">Emergency</span>
</button>
</nav>



    </>
  );
}
