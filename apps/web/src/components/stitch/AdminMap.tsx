import React from 'react';

export function AdminMap() {
  return (
    <>
      
<div className="flex h-screen w-full">
{/* SideNavBar Shared Component */}
<nav className="hidden md:flex flex-col h-full w-64 border-r border-outline-variant bg-surface-container-lowest py-lg transition-all duration-200 ease-in-out z-20 shrink-0">
{/* Header */}
<div className="px-md mb-xl flex items-center gap-md">
<img alt="Staff Profile" className="w-12 h-12 rounded-full object-cover border border-outline-variant" data-alt="A clean, professional headshot of a hospital administrator in a well-lit, modern office environment. They are wearing practical business casual attire. The image is brightly lit, adhering to a sterile but welcoming light-mode aesthetic with clinical blue undertones." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJVwGHTPeYIm8j48ZrRyE1Yg3p5IaTbj94q0j0xXS3TEzgnIoNR8rdeIlfa5IdsmaPb6-8rtDMvilixQYEzkdQ8x8KvjMaY8k4BdiWQV_4uN9rt94ZWa2g2WxKEm8IUx4oWbl4xPRu4u742BJud2uYDtduW0KiHCGUS8qmPs5whd76Lan6dsyGe9Az0XsCXfKXAPDCwCcOHs4qOOO0gS6KO3q1zX0pA37iRG4cUyVWI-JHOMThz67e" />
<div>
<h1 className="font-title-md text-title-md font-semibold text-on-surface">Admin Console</h1>
<p className="font-label-md text-label-md text-on-surface-variant">Staff Access Only</p>
</div>
</div>
{/* Navigation Links */}
<div className="flex-1 flex flex-col gap-sm px-md">
<a className="flex items-center gap-md px-4 py-2 text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors rounded-lg group" href="{{DATA:SCREEN:SCREEN_4}}">
<span className="material-symbols-outlined" data-icon="clinical_notes">clinical_notes</span>
<span className="font-label-md text-label-md">Operations</span>
</a>
<a className="flex items-center gap-md px-4 py-2 text-primary font-bold border-l-4 border-primary bg-primary-container/10 rounded-r-lg" href="#">
<span className="material-symbols-outlined" data-icon="map" data-weight="fill" style={{ fontVariationSettings: '\'FILL\' 1' }}>map</span>
<span className="font-label-md text-label-md">Map Editor</span>
</a>
<a className="flex items-center gap-md px-4 py-2 text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors rounded-lg group" href="#">
<span className="material-symbols-outlined" data-icon="insights">insights</span>
<span className="font-label-md text-label-md">Analytics</span>
</a>
<a className="flex items-center gap-md px-4 py-2 text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors rounded-lg group" href="#">
<span className="material-symbols-outlined" data-icon="emergency_home">emergency_home</span>
<span className="font-label-md text-label-md">Emergency</span>
</a>
</div>
{/* CTA */}
<div className="px-md mt-auto mb-md">
<button className="w-full h-touch-target bg-error text-on-error font-label-lg text-label-lg rounded-lg flex items-center justify-center gap-sm active:scale-95 transition-transform shadow-sm">
<span className="material-symbols-outlined">warning</span>
                    Code Blue Alert
                </button>
</div>
{/* Footer Links */}
<div className="border-t border-outline-variant pt-md px-md flex flex-col gap-sm">
<a className="flex items-center gap-md px-4 py-2 text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors rounded-lg group" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-label-md text-label-md">Settings</span>
</a>
<a className="flex items-center gap-md px-4 py-2 text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors rounded-lg group" href="#">
<span className="material-symbols-outlined" data-icon="help">help</span>
<span className="font-label-md text-label-md">Help</span>
</a>
</div>
</nav>
{/* Main Content Area */}
<main className="flex-1 flex relative bg-surface-dim overflow-hidden">
{/* Map Workspace */}
<div className="flex-1 relative cursor-crosshair group">
{/* Blueprint Background */}
<div className="absolute inset-0 bg-cover bg-center opacity-70" data-alt="A highly detailed, technical blueprint of a large modern hospital floor plan viewed from directly above. The blueprint is rendered in high contrast with deep clinical blue lines on a crisp white background. It shows corridors, structural pillars, and various partitioned rooms with technical architectural notations, adhering to a minimalist practical medical aesthetic." style={{ backgroundImage: 'url(\'https' }}></div>
{/* Grid Overlay */}
<div className="absolute inset-0 pointer-events-none" style={{ backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, rgba(196, 199, 197, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(196, 199, 197, 0.2) 1px, transparent 1px)' }}></div>
{/* Floating Toolbar */}
<div className="absolute left-md top-md bg-surface border border-outline-variant rounded-xl shadow-sm flex flex-col p-unit z-10">
<button className="w-10 h-10 flex items-center justify-center text-primary bg-primary-container rounded-lg mb-unit hover:bg-primary-container/80 transition-colors" title="Pointer Tool">
<span className="material-symbols-outlined">arrow_selector_tool</span>
</button>
<button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg mb-unit transition-colors" title="Draw Path">
<span className="material-symbols-outlined">polyline</span>
</button>
<button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg mb-unit transition-colors" title="Add Room Node">
<span className="material-symbols-outlined">add_location_alt</span>
</button>
<div className="w-full h-px bg-outline-variant my-unit"></div>
<button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg mb-unit transition-colors" title="Zoom In">
<span className="material-symbols-outlined">zoom_in</span>
</button>
<button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg transition-colors" title="Zoom Out">
<span className="material-symbols-outlined">zoom_out</span>
</button>
</div>
</div>
{/* Node Properties Side Panel */}
<aside className="w-80 bg-surface border-l border-outline-variant flex flex-col h-full z-10 shrink-0">
<div className="p-md border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
<h2 className="font-title-md text-title-md text-on-surface">Node Properties</h2>
<span className="px-2 py-1 bg-primary-container text-on-primary-container rounded font-label-md text-label-md">Selected</span>
</div>
<div className="p-md flex-1 overflow-y-auto flex flex-col gap-lg">
{/* Form Group: ID */}
<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md text-on-surface-variant">Node ID</label>
<input className="w-full h-10 px-sm bg-surface-container-low border-outline-variant rounded-lg text-on-surface-variant font-body-md cursor-not-allowed" disabled type="text" value="ND-304-CRD" />
</div>
{/* Form Group: Name */}
<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md text-on-surface">Display Name</label>
<input className="w-full h-10 px-sm bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" type="text" value="Cardiology Waiting Area B" />
</div>
{/* Form Group: Department */}
<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md text-on-surface">Department Category</label>
<select className="w-full h-10 px-sm bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
<option>Cardiology</option>
<option>Neurology</option>
<option>Pediatrics</option>
<option>General Routing</option>
</select>
</div>
{/* Form Group: Toggles */}
<div className="flex flex-col gap-md pt-md border-t border-outline-variant">
<label className="flex items-center justify-between cursor-pointer">
<span className="font-body-md text-on-surface">Wheelchair Accessible</span>
<div className="relative">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</div>
</label>
<label className="flex items-center justify-between cursor-pointer">
<span className="font-body-md text-on-surface">Staff Only Route</span>
<div className="relative">
<input className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</div>
</label>
</div>
</div>
<div className="p-md border-t border-outline-variant bg-surface-container-lowest flex gap-sm">
<button className="flex-1 h-touch-target bg-primary text-on-primary font-label-lg text-label-lg rounded-lg active:scale-95 transition-transform">
                        Save Changes
                    </button>
<button className="w-touch-target h-touch-target flex items-center justify-center border border-error text-error rounded-lg hover:bg-error-container transition-colors" title="Delete Node">
<span className="material-symbols-outlined">delete</span>
</button>
</div>
</aside>
</main>
</div>



    </>
  );
}
