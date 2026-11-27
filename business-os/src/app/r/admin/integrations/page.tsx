"use client";
import { Guard } from "@/components/restaurant/staff/shell";
import { Badge, Card } from "@/components/ui";

const ROWS: { name: string; kind: string; status: "none" | "manual"; text: string }[] = [
  { name: "Դրամարկղ / POS (iiko/Syrve, r_keeper, Poster…)", kind: "POS", status: "manual", text: "Կողք կողքի աշխատանք. հաշիվը փակվում է Ձեր դրամարկղում, համակարգը նշում է «Հաշիվը փակված է (POS)»։ Ինտեգրումը՝ միայն պաշտոնական API-ով և մատակարարի համաձայնությամբ, ստուգելուց հետո։" },
  { name: "Ֆիսկալ կտրոն (ՊԵԿ ՀԴՄ / e-HDM)", kind: "Ֆիսկալ", status: "none", text: "Մենք ֆիսկալ կտրոններ չենք տալիս։ Կտրոնը տրվում է Ձեր գործող ՀԴՄ-ով, ինչպես հիմա։" },
  { name: "Առցանց վճարում (բանկային vPOS, Idram, Telcell)", kind: "Վճարում", status: "none", text: "Վճարումը կատարվում է ռեստորանում։ Առցանց վճարումը պահանջում է բանկի/մատակարարի պայմանագիր և ստուգում։" },
  { name: "Առաքման հարթակներ (Yandex Eats և այլն)", kind: "Առաքում", status: "none", text: "Միացված չէ։ Հնարավոր է միայն պաշտոնական գործընկերային API-ով։" },
  { name: "Telegram / WhatsApp / Viber / SMS / էլ. փոստ", kind: "Հաղորդագրություններ", status: "none", text: "Ցուցադրության մեջ հաղորդագրությունները սիմուլյացիա են։ Պիլոտում՝ Telegram անձնակազմի համար, համաձայնությամբ՝ հյուրերի համար։" },
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
    </Guard>
  );
}
