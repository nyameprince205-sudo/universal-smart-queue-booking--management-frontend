import { Link } from "react-router-dom";
function AppFooter() {
  const year = new Date().getFullYear();
  return <footer className="border-t border-warm-border px-4 sm:px-8 py-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs text-warm-muted">© {year} SmartQueue</p>
        <Link to="/support" className="text-xs text-warm-muted hover:text-forest-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 rounded">
          Support
        </Link>
      </div>
    </footer>;
}
export default AppFooter;