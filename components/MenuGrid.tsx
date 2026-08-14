import type { MenuItem } from "@/types";
import ItemCard from "@/components/ItemCard";

export default function MenuGrid({
  menu,
  onSelect,
}: {
  menu: MenuItem[];
  onSelect: (item: MenuItem) => void;
}) {
  const categories = Array.from(new Set(menu.map((item) => item.category)));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {categories.map((category) => (
        <section key={category} className="mb-8">
          <h2 className="font-heading mb-4 text-xl font-bold text-stone-900">{category}</h2>
          <div className="divide-y divide-stone-200 rounded-xl border border-stone-200">
            {menu
              .filter((item) => item.category === category)
              .map((item) => (
                <ItemCard key={item.name} item={item} onSelect={onSelect} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
