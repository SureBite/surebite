export function AuthSidebar() {
  return (
    <aside className="hidden flex-col rounded-3xl bg-brand p-9 text-white lg:flex">
      <span className="pill self-start bg-white uppercase tracking-wide text-brand">Made for restaurants</span>
      <p className="mt-8 font-serif text-4xl leading-tight">
        A thoughtful menu.
        <br />A warmer welcome.
      </p>
      <p className="mt-5 max-w-md text-sm text-white/85">
        Bring your paper menu online, with allergen information checked by the people who know your kitchen.
      </p>
      <img
        src="/images/food-table.jpg"
        alt="Bowls of chana masala and dal on a restaurant table"
        className="mt-8 min-h-[12rem] w-full flex-1 rounded-2xl object-cover"
      />
      <div className="mt-8 border-t border-white/30 pt-6">
        <p className="font-semibold">AI Infers. Humans Verify. Diners Stay Safe.</p>
        <p className="mt-3 text-xs text-white/80">Only staff-verified, published menus reach your guests.</p>
      </div>
    </aside>
  )
}

export default AuthSidebar
