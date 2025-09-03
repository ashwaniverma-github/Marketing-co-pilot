'use client';

import { CloseIcon, SparklesIcon, PlusIcon } from '@/components/icons';

// Define tab types to match exactly what's in the dashboard-client
type TabId = 'content' | 'chat';

type TabItem = {
  id: TabId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface SidebarProps {
  sidebarCollapsed: boolean;
  activeTab: TabId;
  setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
  tabs: TabItem[];
  proTipDismissed: boolean;
  dismissProTip: () => void;
  setShowAddProductModal: (show: boolean) => void;
}

export function Sidebar({
  sidebarCollapsed,
  activeTab,
  setActiveTab,
  tabs,
  proTipDismissed,
  dismissProTip,
  setShowAddProductModal
}: SidebarProps) {
  return (
    <div className="w-full sticky top-[4.5rem] z-30">
      {/* Horizontal Navigation Bar */}
      <div className=" mx-auto flex justify-center mb-4">
        <div className="flex justify-between items-center">
          {/* Tab Navigation */}
          <div className="flex space-x-4">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-cyan-950 dark:text-cyan-800 transform scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:scale-105'
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>
          
          
        </div>
        
        {/* Pro Tip Section - Only show when not dismissed */}
        {!proTipDismissed && (
          <div className="mt-4 p-3 bg-blue-500/10 dark:bg-blue-500/5 rounded-lg border border-blue-200/50 dark:border-blue-800/30 relative">
            <button
              onClick={dismissProTip}
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-md transition-all"
              title="Dismiss pro tip"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 mt-0.5">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <SparklesIcon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-foreground text-sm mb-1 pr-6">Quick Tip</h4>
                <p className="text-xs text-muted-foreground">
                  Use the Chat tab to generate tweet ideas, then post them directly from the Content tab.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}