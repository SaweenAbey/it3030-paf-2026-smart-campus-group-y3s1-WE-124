import { useSearchParams } from 'react-router-dom';

const Sidebar = ({ items, title = "Menu", activeTab: controlledActiveTab, onTabChange: controlledOnTabChange, children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : (searchParams.get('tab') || items[0]?.key);

  const openTab = (tab) => {
    if (isControlled && controlledOnTabChange) {
      controlledOnTabChange(tab);
    } else {
      setSearchParams({ tab });
    }
  };

  return (
    <aside
      className="sticky top-20 z-10 flex w-full flex-col gap-5 rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-xl backdrop-blur-xl lg:w-64 lg:min-w-[250px]"
    >
      <div className="hidden lg:block rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
          {title}
        </p>
      </div>
      <nav className="flex flex-row overflow-x-auto pb-2 lg:pb-0 lg:flex-col lg:overflow-visible gap-2 scrollbar-hide">
        {items.map((item) => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => openTab(item.key)}
              className={`relative shrink-0 lg:w-full overflow-hidden rounded-xl border px-5 py-3 text-left font-black transition-all duration-300 ${
                active
                  ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                  : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="relative z-10 block text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>
      {children && (
        <div className="hidden lg:block border-t border-slate-100 pt-4">
          {children}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
