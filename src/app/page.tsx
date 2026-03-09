import { PlusIcon } from "lucide-react";
import { TemplateList } from "@/components/template/template-list";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen w-full">
      <header className="fixed top-0 h-14 border-b bg-background w-full px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold font-mono">Formex</h1>
        <Button>
          New Template
          <PlusIcon />
        </Button>
      </header>
      <div className="pt-14">
        <TemplateList />
      </div>
    </main>
  );
}
