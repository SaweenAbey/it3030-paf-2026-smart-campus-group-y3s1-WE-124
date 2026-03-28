import { useSearchParams } from 'react-router-dom';

const Sidebar = ({ items }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || items[0]?.key;

  const openTab = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <aside className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm h-fit sticky top-20">
      <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold px-3 py-2">
        Menu
      </p>
      <nav className="space-y-1 mt-2">
        {items.map((item) => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => openTab(item.key)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 ${
                active
                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {item.icon && <span className="text-lg">{item.icon}</span>}
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
