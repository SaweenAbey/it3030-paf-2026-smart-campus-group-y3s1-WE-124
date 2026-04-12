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
      style={{ minWidth: 250 }}
      className="sticky top-20 z-10 flex h-fit w-full flex-col gap-5 rounded-4xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl"
    >
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          {title}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Operational navigation for the admin workspace.
        </p>
      </div>
      <nav className="flex-1 space-y-2">
        {items.map((item) => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => openTab(item.key)}
              className={`relative w-full overflow-hidden rounded-2xl border px-4 py-3.5 text-left font-semibold transition-all duration-200 ${
                active
                  ? 'border-sky-200 bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                  : 'border-slate-200/70 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="relative z-10 block text-sm tracking-wide">{item.label}</span>
              {active && <span className="absolute inset-y-0 left-0 w-1 bg-sky-400" aria-hidden />}
            </button>
          );
        })}
      </nav>
      {children && (
        <div className="border-t border-slate-100 pt-4">
          {children}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
