import ThemeSelector from "@/components/ThemeSelector";

export default function PreferencesPage() {
  return (
    <div>
      <h2 className="text-2xl xl:text-3xl font-bold">Account Appearance</h2>

      <ThemeSelector />
    </div>
  );
}
