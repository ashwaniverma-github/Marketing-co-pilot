'use client';

// Define tab types to match exactly what's in the dashboard-client
type TabId = 'Content' | 'Chat' | 'Knowledge base' | 'Progress';

type TabItem = {
  id: TabId;
  name: string;
};

interface TopbarProps {
  activeTab: TabId;
  setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
  tabs: TabItem[];

}

export function Topbar({
  activeTab,
  setActiveTab,
  tabs,
}: TopbarProps) {
  return (
    <div className="w-full sm:sticky top-[4.5rem] z-30">
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
                  className={`px-4 sm:py-1 py-4 rounded-lg text-sm font-medium transition-all ${
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
      </div>
    </div>
  );
}