import NewTemplateButton from "@/components/new-template.button";
import { TemplateList } from "@/components/template-list";

export default function Page() {
  return (
    <div className="flex flex-col gap-3 w-full min-h-full">
      <header className="flex justify-between items-center px-6 h-14 bg-background border-b">
        <div className="text-lg font-semibold font-heading">Templates</div>
        <NewTemplateButton />
      </header>

      <TemplateList />
    </div>
  );
}
