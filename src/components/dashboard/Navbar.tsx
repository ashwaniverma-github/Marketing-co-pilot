'use client';

import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  PlusIcon,
  ChevronDownIcon,
  CheckIcon,
  MenuIcon
} from '@/components/icons';

// Match the Product interface from dashboard-client
interface Product {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  url: string;
  logoUrl?: string;
  category: string;
  stage: string;
  status: string;
  launchDate?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // For any other properties
}

interface NavbarProps {
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  setShowAddProductModal: (show: boolean) => void;
}

export function Navbar({
  products,
  selectedProduct,
  setSelectedProduct,
  setShowAddProductModal
}: NavbarProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="bg-background dark:bg-card/60  shadow-sm border border-gray-200/50 dark:border-gray-700/30 p-2 rounded-full sm:w-10/13 mx-1 sm:mx-auto mt-4 sm:mt-0 sm:sticky top-4 z-40 ">
      <div className="flex items-center justify-center">
        <div className="flex items-center  sm:space-x-10">
          
          <span className="hidden md:block font-bold text-foreground font-mono">Indiegrowth - Your App's Growth Co-Pilot</span>
          <span className="block md:hidden font-bold  text-foreground font-mono">Indiegrowth</span>
          
          {/* Product Selector - Only when products exist */}
          {products.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center  space-x-2  rounded-lg px-2 py-2 transition-all min-w-[160px]">
                  <span className="font-medium text-foreground text-sm truncate ">
                    {selectedProduct?.name}
                  </span>
                  <ChevronDownIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {products.map((product) => (
                  <DropdownMenuItem
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="flex items-center justify-between px-3 py-2 cursor-pointer"
                  >
                    <span className="font-medium text-foreground truncate">{product.name}</span>
                    {selectedProduct?.id === product.id && (
                      <CheckIcon className="w-4 h-4 text-foreground flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="font-medium">Add Product</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Add Product Button - When no products */}
          {products.length === 0 && (
            <button
              onClick={() => setShowAddProductModal(true)}
              className="flex items-center space-x-2 bg-foreground text-background mx-2 p-1 rounded-lg hover:bg-foreground/90 font-medium transition-all"
            >
              <span>Add Product</span>
              <PlusIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right actions: theme + profile */}
        <div className="flex items-center space-x-2 sm:space-x-20">
          <ThemeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {(session as any)?.xAvatar ? (
                  <button className="w-9 h-9 rounded-full overflow-hidden hover:opacity-90 transition-opacity border border-border">
                    <img 
                      src={(session as any).xAvatar} 
                      alt={(session as any).xUsername || user.name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ) : (
                  <button className="w-9 h-9 rounded-full overflow-hidden hover:opacity-90 transition-opacity border border-border">
                    <img 
                    src={session?.user?.image || ''}
                    alt={session?.user?.name || 'User'} 
                    className="w-full h-full object-cover" />
                  </button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">
                  {user.name}
                </DropdownMenuItem>
                {(session as any)?.xUsername ? (
                  <DropdownMenuItem className="flex items-center text-muted-foreground text-sm">
                    @{(session as any).xUsername}
                    {(session as any).xVerified && (
                      <span className="ml-1 text-blue-500 flex items-center" title="Verified">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </DropdownMenuItem>
                ) : (
                  // For non-Twitter users, show email
                  user.email && (
                    <DropdownMenuItem className="text-muted-foreground text-sm">
                      {user.email}
                    </DropdownMenuItem>
                  )
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="text-red-600 cursor-pointer dark:text-red-400">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}