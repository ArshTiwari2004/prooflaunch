import Icon from "./Icon";

export interface FaqItem {
  q: string;
  a: string;
}

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="faq">
      {items.map((item) => (
        <details key={item.q}>
          <summary>
            {item.q}
            <Icon name="chevron-down" size={18} />
          </summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
