"use client";
import { Guard } from "@/components/restaurant/staff/shell";
import { Badge, Card, CardHead } from "@/components/ui";
import { CHANNELS, LINK_LABEL, REVIEW_PLATFORMS } from "@/lib/restaurant/channels";

const ROWS: { name: string; kind: string; status: "none" | "manual"; text: string }[] = [
  { name: "Դրամարկղ / POS (iiko/Syrve, r_keeper, Poster…)", kind: "POS", status: "manual", text: "Կողք կողքի աշխատանք. հաշիվը փակվում է Ձեր դրամարկղում, համակարգը նշում է «Հաշիվը փակված է (POS)»։ Ինտեգրումը՝ միայն պաշտոնական API-ով և մատակարարի համաձայնությամբ, ստուգելուց հետո։" },
  { name: "Ֆիսկալ կտրոն (ՊԵԿ ՀԴՄ / e-HDM)", kind: "Ֆիսկալ", status: "none", text: "Մենք ֆիսկալ կտրոններ չենք տալիս։ Կտրոնը տրվում է Ձեր գործող ՀԴՄ-ով, ինչպես հիմա։" },
  { name: "Առցանց վճարում (բանկային vPOS, Idram, Telcell)", kind: "Վճարում", status: "none", text: "Վճարումը կատարվում է ռեստորանում։ Առցանց վճարումը պահանջում է բանկի/մատակարարի պայմանագիր և ստուգում։" },
  { name: "Առաքման հարթակներ (Yandex Eats և այլն)", kind: "Առաքում", status: "none", text: "Միացված չէ։ Հնարավոր է միայն պաշտոնական գործընկերային API-ով։" },
  { name: "Վճարային տերմինալի ադապտեր (demo-terminal)", kind: "Վճարում", status: "none", text: "Մատուցողի հավելվածում «Վճարել քարտով» կոճակը աշխատում է ՍԻՄՈՒԼՅԱՑՎԱԾ ադապտերով։ Վճարումը «վճարված» է համարվում միայն ադապտերի պատասխանից հետո։ Իրական տերմինալ՝ բանկի կամ POS մատակարարի պաշտոնական SDK-ով։" },
  { name: "Ամրագրման հարթակներ (TheFork, OpenTable)", kind: "Ամրագրում", status: "none", text: "API-ն հասանելի է միայն հաստատված գործընկերներին (պայմանագիր, OAuth)։ Մինչ այդ ամրագրումները կայքից, չատից և հեռախոսով մտնում են մեր հոստեսի էկրան։" },
  { name: "SMS / Telegram / Viber", kind: "Հաղորդագրություններ", status: "none", text: "Հիշեցումները և ծանուցումները ցուցադրությունում սիմուլյացիա են (նշված են «Սիմուլյացիա · չի ուղարկվել»)։" },
  { name: "Խոհանոցի տպիչ (Star CloudPRNT, Epson SDP)", kind: "Տպիչ", status: "none", text: "Միացված չէ։ Պիլոտի տարբերակ այն խոհանոցների համար, որոնք նախընտրում են թղթային տոմս։" },
  { name: "Հաշվապահություն (ArmSoft, 1C)", kind: "Հաշվապահություն", status: "manual", text: "Պիլոտում՝ ամենօրյա արտահանում CSV/Excel ձևաչափով։" },
  { name: "RISEUP Hotel OS", kind: "Հյուրանոց", status: "none", text: "Սենյակային սպասարկում և հաշվի փոխանցում սենյակին՝ հաջորդ փուլ (դեռ հաստատված չէ)։" },
];

export default function Integrations() {
  return (
    <Guard perm="automations.manage">
      <div className="mb-4"><h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Ինտեգրացիաներ</h1><p className="mt-1 text-[13.5px] text-muted">Ազնիվ կարգավիճակներ. ոչինչ «Միացված» չի ցուցադրվում, քանի դեռ իրականում միացված և ստուգված չէ։</p></div>
      <div className="grid gap-3 md:grid-cols-2">{ROWS.map((r) => (
        <Card key={r.name}><div className="flex items-start justify-between gap-3"><div><div className="text-[12px] text-muted">{r.kind}</div><div className="text-[14.5px] font-semibold">{r.name}</div></div>{r.status === "manual" ? <Badge tone="info">Ձեռքով / կողք կողքի</Badge> : <Badge tone="neutral">Միացված չէ</Badge>}</div><p className="mt-2 text-[13px] text-muted">{r.text}</p></Card>
      ))}</div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHead title="Հաղորդագրությունների ալիքներ" sub="Միասնական Inbox" icon="message" />
          <ul className="space-y-3">{Object.values(CHANNELS).map((c) => <li key={c.name}><div className="flex items-center gap-2"><span className="text-[14px] font-semibold">{c.name}</span><Badge tone={c.state === "in_product" ? "ok" : "neutral"} className="ml-auto">{LINK_LABEL[c.state]}</Badge></div>{c.needs.length > 0 && <p className="text-[12.5px] text-muted">Պահանջվում է՝ {c.needs.join(" · ")}</p>}</li>)}</ul></Card>
        <Card><CardHead title="Կարծիքների հարթակներ" icon="star" />
          <ul className="space-y-3">{Object.values(REVIEW_PLATFORMS).map((c) => <li key={c.name}><div className="flex items-center gap-2"><span className="text-[14px] font-semibold">{c.name}</span><Badge className="ml-auto">{LINK_LABEL[c.state]}</Badge></div><p className="text-[12.5px] text-muted">Պահանջվում է՝ {c.needs.join(" · ")}</p><p className="text-[12px] text-faint">{c.limits.join(" · ")}</p></li>)}</ul></Card>
      </div>
      <p className="mt-4 text-[12px] text-faint">Ոչ պաշտոնական «scraping» ինտեգրացիաներ չեն օգտագործվում։</p>
    </Guard>
  );
}
