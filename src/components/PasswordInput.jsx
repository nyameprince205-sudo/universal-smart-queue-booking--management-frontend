import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
function PasswordInput({
  value,
  onChange,
  id,
  required,
  placeholder,
  className,
  autoComplete
}) {
  const [visible, setVisible] = useState(false);
  return <div className="relative">
      <input id={id} type={visible ? "text" : "password"} required={required} placeholder={placeholder} value={value} onChange={onChange} autoComplete={autoComplete} className={`${className || ""} pr-10`} />
      <button type="button" onClick={() => setVisible(v => !v)} aria-label={visible ? "Hide password" : "Show password"} className="absolute right-0 top-0 h-full px-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>;
}
export default PasswordInput;