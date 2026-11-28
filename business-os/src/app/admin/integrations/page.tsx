"use client";
import { useState } from "react";
import { PageTitle } from "@/components/admin/shell";
import { Badge, Button, Card, cn, Modal, Segmented } from "@/components/ui";
import { CLASS_LABEL, INTEGRATIONS, type Integration } from "@/lib/channel-adapters";

const AREA: Record<Integration["area"], string> = { messaging: "Հաղորդակցություն", reviews: "Կարծիքներ", distribution: "Ալիքներ (OTA)", pms: "PMS / ալիքների կառավարիչ", payments: "Վճարումներ", restaurant: "Ռեստորան" };
const TONE = { 1: "ok", 2: "info", 3: "violet", 4: "bad", 5: "neutral" } as const;

export default function Integrations() {
  const [area, setArea] = useState<Integration["area"] | "all">("all");
  const [cur, setCur] = useState<Integration | null>(null);
  const list = INTEGRATIONS.filter((i) => area === "all" || i.area === area);
  return (
    <>
      <PageTitle title="Ինտեգրացիաներ" sub="Յուրաքանչյուր արտաքին համակարգի իրական կարգավիճակը՝ պաշտոնական փաստաթղթերի հիման վրա" />
      <div className="mb-4 rounded-xl border border-line bg-surface px-4 py-3 text-[13px] text-ink-2">
        <b>Կանոն.</b> Hotel OS-ը երբեք չի ցույց տալիս ինտեգրացիան որպես «միացված», քանի դեռ այն իրականում նույնականացված և փորձարկված չէ։ Ցուցադրական ռեժիմում բոլոր ալիքները <b>սիմուլյացված</b> են։ Scraping կամ ոչ պաշտոնական API-ներ չեն օգտագործվում։
      </div>
      <div className="mb-3 overflow-x-auto"><Segmented value={area} onChange={setArea} items={[{ id: "all", label: "Բոլորը" }, ...(Object.keys(AREA) as Integration["area"][]).map((a) => ({ id: a, label: AREA[a] }))]} /></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((i) => (
          <Card key={i.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-2"><div><div className="text-[14.5px] font-semibold">{i.name}</div><div className="text-[12px] text-muted">{AREA[i.area]}</div></div><Badge tone={TONE[i.cls]}>{i.cls}</Badge></div>
            <div className="mt-2 text-[12.5px] font-medium">{CLASS_LABEL[i.cls]}</div>
            <p className="mt-1 line-clamp-3 text-[12.5px] text-muted">{i.requirements}</p>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
              <Badge tone={i.demo === "simulated" ? "warn" : "neutral"}>{i.demo === "simulated" ? "Ցուցադրական սիմուլյացիա" : "Միացված չէ"}</Badge>
              <Button size="sm" className="ml-auto" onClick={() => setCur(i)}>Մանրամասներ</Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={!!cur} onClose={() => setCur(null)} size="lg" title={cur?.name ?? ""} footer={<><Button variant="ghost" onClick={() => setCur(null)}>Փակել</Button><Button variant="primary" disabled title="Պահանջում է հաճախորդի հաշիվ, հաստատում և գաղտնի բանալիներ գաղտնի պահոցում">Միացնել (պահանջում է հաստատում)</Button></>}>
        {cur && (
          <dl className="grid gap-3 text-[13px] sm:grid-cols-[160px_1fr]">
            {([["Դասակարգում", `${cur.cls} · ${CLASS_LABEL[cur.cls]}`], ["Պաշտոնական մեթոդ", cur.official], ["Նույնականացում", cur.auth], ["Պահանջներ", cur.requirements], ["Սահմանափակումներ", cur.limits], ["Այլընտրանք", cur.alternative], ["Աղբյուր", cur.source]] as [string, string][]).map(([k, v]) => (
              <div key={k} className="contents"><dt className="font-medium text-muted">{k}</dt><dd className={cn(k === "Աղբյուր" && "font-mono text-[12px]")}>{v}</dd></div>
            ))}
            <p className="text-[12px] text-muted sm:col-span-2">Գաղտնի բանալիները (tokens) պահվում են սերվերային գաղտնի պահոցում, երբեք բրաուզերում։ OAuth token-ների թարմացումն ու հետկանչը, webhook-ների ստորագրության ստուգումը և rate limit-ները նկարագրված են docs/HOTEL_OS_SECURITY_REQUIREMENTS.md-ում։</p>
          </dl>
        )}
      </Modal>
    </>
  );
}
