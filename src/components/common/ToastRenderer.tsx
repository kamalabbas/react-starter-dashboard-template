import { useEffect } from "react";
import { useToastStore } from "@/stores/toastStore";
import Alert from "@/components/ui/alert/Alert";

export default function ToastRenderer() {
  const visible = useToastStore((s) => s.visible);
  const message = useToastStore((s) => s.message);
  const type = useToastStore((s) => s.type);
  const persist = useToastStore((s) => s.persist);
  const hideToast = useToastStore((s) => s.hideToast);

  useEffect(() => {
    if (!visible || persist) return;
    const timer = window.setTimeout(() => hideToast(), 1000);
    return () => window.clearTimeout(timer);
  }, [visible, persist, hideToast]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-[999999] w-[280px] max-w-[calc(100vw-2rem)]">
      <div className="relative rounded-xl bg-white dark:bg-gray-900">
        <Alert variant={type} title={type === "error" ? "Error" : "Success"} message={message} />
        <button
          type="button"
          aria-label="Close"
          onClick={() => hideToast()}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
    </div>
  );
}
