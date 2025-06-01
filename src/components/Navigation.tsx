
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Prescription, 
  FileText as Letter,
  User,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigationItems = [
  { to: '/consultation', label: 'Consultation', icon: FileText },
  { to: '/diagnostic', label: 'Diagnostic', icon: Search },
  { to: '/traitement', label: 'Traitement', icon: Prescription },
  { to: '/courrier', label: 'Courrier', icon: Letter },
  { to: '/etp', label: 'Fiche ETP', icon: User },
];

const NavigationContent = () => (
  <nav className="space-y-2">
    {navigationItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive
              ? 'bg-medical-primary text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 hover:text-medical-primary'
          }`
        }
      >
        <item.icon className="w-5 h-5" />
        <span className="font-medium">{item.label}</span>
      </NavLink>
    ))}
  </nav>
);

export const MobileNavigation = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon" className="md:hidden">
        <Menu className="h-4 w-4" />
      </Button>
    </SheetTrigger>
    <SheetContent side="left" className="w-64">
      <div className="py-6">
        <h2 className="text-lg font-semibold text-medical-primary mb-6">SANO Express</h2>
        <NavigationContent />
      </div>
    </SheetContent>
  </Sheet>
);

export const DesktopNavigation = () => (
  <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
    <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <h1 className="text-xl font-bold medical-gradient bg-clip-text text-transparent">
          SANO Express
        </h1>
      </div>
      <div className="mt-8 flex-grow px-4">
        <NavigationContent />
      </div>
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">Assistant IA pour médecins</p>
      </div>
    </div>
  </aside>
);
