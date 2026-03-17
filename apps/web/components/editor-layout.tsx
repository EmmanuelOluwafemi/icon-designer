import { PackPrompt } from "./pack-prompt"

export function EditorLayout() {
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <PackPrompt />
      <header role="banner" className="flex h-12 shrink-0 items-center border-b px-4">
        <span className="text-sm font-medium">Icon Builder</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav role="toolbar" aria-label="Tools" className="flex w-12 shrink-0 flex-col items-center gap-1 border-r py-2">
        </nav>

        <aside role="complementary" aria-label="Icons" className="flex w-60 shrink-0 flex-col border-r">
        </aside>

        <main className="flex flex-1 overflow-hidden">
        </main>

        <section role="region" aria-label="Properties" className="flex w-64 shrink-0 flex-col border-l">
        </section>
      </div>
    </div>
  )
}
