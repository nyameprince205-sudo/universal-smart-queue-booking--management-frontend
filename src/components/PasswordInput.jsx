import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

function PasswordInput({
value,
onChange,
id,
required,
placeholder = "Enter your password",
className = "",
autoComplete,
}) {
const [visible, setVisible] = useState(false);

return ( <div className="relative w-full">
<input
id={id}
name={id}
type={visible ? "text" : "password"}
required={required}
placeholder={placeholder}
value={value}
onChange={onChange}
autoComplete={autoComplete}
className={`           block w-full rounded-xl border border-stone-200
          bg-stone-50 py-3 pl-4 pr-12 text-sm text-stone-900
          placeholder:text-stone-400
          transition-all duration-200
          hover:border-stone-300
          focus:border-emerald-600 focus:bg-white
          focus:outline-none focus:ring-4 focus:ring-emerald-600/10
          disabled:cursor-not-allowed disabled:opacity-60
          ${className}
        `}
/>


  <button
    type="button"
    onClick={() => setVisible((previous) => !previous)}
    aria-label={visible ? "Hide password" : "Show password"}
    aria-controls={id}
    aria-pressed={visible}
    className="
      absolute right-2 top-1/2 flex h-9 w-9
      -translate-y-1/2 items-center justify-center
      rounded-lg text-stone-400
      transition-colors duration-200
      hover:bg-emerald-50 hover:text-emerald-700
      focus:outline-none focus:ring-2 focus:ring-emerald-500
      focus:ring-offset-1
    "
  >
    {visible ? (
      <EyeOff className="h-4 w-4" aria-hidden="true" />
    ) : (
      <Eye className="h-4 w-4" aria-hidden="true" />
    )}
  </button>
</div>


);
}

export default PasswordInput;
