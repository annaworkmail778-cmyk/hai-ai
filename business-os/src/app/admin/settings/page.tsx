"use client";
import { PageTitle } from "@/components/admin/shell";
import { Icon, type IconName } from "@/components/icons";
import { Badge, Card, CardHead, cn } from "@/components/ui";
import { useDemo } from "@/lib/client/demo-store";
import type { Property } from "@/lib/types";

const TYPES: { id: Property["type"]; title: string; text: string; icon: IconName }[] = [
  { id: "hotel", title: "Միայն հյուրանոց", text: "Ամրագրումներ, սենյակներ, մաքրություն, QR ծառայություններ, հավատարմություն, թիմ", icon: "bed" },
  { id: "restaurant", title: "Միայն ռեստորան", text: "Մենյու, պատվերներ, KDS, սեղաններ, հավատարմություն, թիմ", icon: "coffee" },
  { id: "hotel_restaurant", title: "Հյուրանոց + ռեստորան + ծառայություններ", text: "Ամբողջական համակարգ՝ բոլոր մոդուլներով", icon: "home" },
];
const MOD: Record<string, string> = { rooms: "Սենյակներ", reservations: "Ամրագրումներ", restaurant: "Ռեստորան և KDS", services: "QR ծառայություններ", loyalty: "Հավատարմություն", staff: "Աշխատակցի հավելված", training: "Ուսուցում", analytics: "Վերլուծություն" };

export default function Settings() {
  const { state, dispatch } = useDemo();
  const pr = state.property;
  return (
    <>
      <PageTitle title="Օբյեկտի կարգավորումներ" sub="Համակարգը կարգավորվում է ըստ բիզնեսի տեսակի (ցուցադրական)" />
      <div className="grid gap-3 md:grid-cols-3">
        {TYPES.map((t) => (
          <button key={t.id} onClick={() => dispatch({ type: "property.update", patch: { type: t.id } })} className={cn("rounded-xl border bg-surface p-4 text-left transition", pr.type === t.id ? "border-ink ring-2 ring-ink" : "border-line hover:border-ink/30")}>
            <div className="flex items-center justify-between"><Icon name={t.icon} size={22} />{pr.type === t.id && <Badge tone="ok">Ընտրված</Badge>}</div>
            <div className="mt-3 text-[15px] font-semibold">{t.title}</div>
            <p className="mt-1 text-[13px] text-muted">{t.text}</p>
          </button>
        ))}
      </div>
      <Card className="mt-4">
        <CardHead title="Միացված մոդուլներ" sub="Վահանակի նավիգացիան ավտոմատ համապատասխանում է ընտրված տեսակին" />
        <div className="mt-3 flex flex-wrap gap-2">{Object.keys(MOD).map((m) => <Badge key={m} tone={pr.modules.includes(m) ? "ok" : "neutral"}>{pr.modules.includes(m) ? "✓" : "—"} {MOD[m]}</Badge>)}</div>
      </Card>
      <Card className="mt-4">
        <CardHead title="Բազմաօբյեկտային (multi-tenant) պատրաստվածություն" />
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-muted">
          <li>Բոլոր տվյալները կապված են մեկ օբյեկտի (property) հետ․ ID՝ <code>{pr.id}</code>, բրենդ՝ {pr.brand}</li>
          <li>Արտադրական տարբերակում յուրաքանչյուր աղյուսակ ունի <code>property_id</code>, իսկ մուտքը սահմանափակվում է Row Level Security-ով</li>
          <li>Մեկ սեփականատերը կարող է ունենալ մի քանի օբյեկտ (հյուրանոց, ռեստորան, սպա)՝ ընդհանուր հավատարմության ծրագրով</li>
          <li>Ինտեգրացիաները (PMS, POS, վճարումներ, channel manager, WhatsApp) <b>միացված չեն</b>․ տե՛ս ճանապարհային քարտեզը</li>
        </ul>
      </Card>
    </>
  );
}
