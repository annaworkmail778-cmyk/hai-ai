import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { AppFrame, Bubble, ChannelIcon, CheckBadge, Chip, Enter, PhoneFrame, Stat, Toast, Typing } from "./kit";
import type { DemoDefinition, ScreenProps } from "./types";

/* DEMO CONTENT — "Riseup Orders": orders from Instagram for an online shop. Names and figures are illustrative. */

const ui = {
  en: {
    shop: "Mira Store",
    handle: "clothing · Instagram",
    ai: "AI assistant",
    msg1: "Hi! Is this dress available in M? How much?",
    product: "Linen dress, sand",
    price: "18 900 ֏",
    sizes: "S · M · L",
    ai1: "Yes, size M is in stock. The price is 18 900 ֏, delivery in Yerevan is 1 000 ֏. Shall I place the order?",
    msg2: "Yes please! Gayane, Komitas 30, apt 12",
    ai2: "Thank you, Gayane! Order #1042 is placed. We'll deliver tomorrow between 12:00 and 16:00.",
    orderNo: "Order #1042",
    orderText: "Linen dress · M · 19 900 ֏ with delivery",
    onWay: "Your order is on the way",
    onWayText: "Courier Aram will arrive between 12:00 and 16:00.",
    title: "Mira Store · Orders",
    nav: ["Orders", "Chats", "Stock", "Reports"],
    columns: ["New", "Paid", "On the way", "Delivered"],
    cards: [
      ["#1039", "Shirt · L", 2],
      ["#1040", "Bag · black", 1],
      ["#1041", "Dress · S", 3],
      ["#1037", "Scarf", 3],
    ],
    newCard: ["#1042", "Linen dress · M"],
    stock: "Stock · Linen dress",
    sizeRows: [
      ["S", 4],
      ["M", 3],
      ["L", 1],
    ],
    low: "Low",
    toast: "New order from Instagram",
    toastText: "#1042 · Gayane · 19 900 ֏",
    courierToast: "Sent to the courier",
    courierText: "#1042 · Komitas 30, apt 12 · 12:00–16:00",
    report: [
      ["Orders today", "23"],
      ["Sales today", "412 000 ֏"],
      ["Waiting for reply", "0"],
    ],
    reportNote: "Bestseller: linen dress",
  },
  hy: {
    shop: "Mira Store",
    handle: "հագուստ · Instagram",
    ai: "AI օգնական",
    msg1: "Բարև։ Այս զգեստը M չափսով կա՞։ Ի՞նչ արժե։",
    product: "Վուշե զգեստ, ավազագույն",
    price: "18 900 ֏",
    sizes: "S · M · L",
    ai1: "Այո, M չափսը կա։ Գինը 18 900 ֏ է, Երևանում առաքումը՝ 1 000 ֏։ Ձևակերպե՞մ պատվերը։",
    msg2: "Այո։ Գայանե, Կոմիտաս 30, բն. 12",
    ai2: "Շնորհակալություն, Գայանե։ #1042 պատվերը ձևակերպված է։ Կառաքենք վաղը՝ 12:00–16:00։",
    orderNo: "Պատվեր #1042",
    orderText: "Վուշե զգեստ · M · 19 900 ֏ առաքումով",
    onWay: "Ձեր պատվերը ճանապարհին է",
    onWayText: "Առաքիչ Արամը կժամանի 12:00–16:00 ընթացքում։",
    title: "Mira Store · Պատվերներ",
    nav: ["Պատվերներ", "Նամակներ", "Պահեստ", "Հաշվետվություն"],
    columns: ["Նոր", "Վճարված", "Ճանապարհին", "Հանձնված"],
    cards: [
      ["#1039", "Վերնաշապիկ · L", 2],
      ["#1040", "Պայուսակ · սև", 1],
      ["#1041", "Զգեստ · S", 3],
      ["#1037", "Շարֆ", 3],
    ],
    newCard: ["#1042", "Վուշե զգեստ · M"],
    stock: "Պահեստ · Վուշե զգեստ",
    sizeRows: [
      ["S", 4],
      ["M", 3],
      ["L", 1],
    ],
    low: "Քիչ է",
    toast: "Նոր պատվեր Instagram-ից",
    toastText: "#1042 · Գայանե · 19 900 ֏",
    courierToast: "Ուղարկված է առաքիչին",
    courierText: "#1042 · Կոմիտաս 30, բն. 12 · 12:00–16:00",
    report: [
      ["Պատվերներ այսօր", "23"],
      ["Վաճառք այսօր", "412 000 ֏"],
      ["Սպասում են պատասխանի", "0"],
    ],
    reportNote: "Ամենավաճառվողը՝ վուշե զգեստ",
  },
  ru: {
    shop: "Mira Store",
    handle: "одежда · Instagram",
    ai: "AI-ассистент",
    msg1: "Здравствуйте! Это платье есть в размере M? Сколько стоит?",
    product: "Льняное платье, песочное",
    price: "18 900 ֏",
    sizes: "S · M · L",
    ai1: "Да, размер M есть. Цена 18 900 ֏, доставка по Еревану 1 000 ֏. Оформить заказ?",
    msg2: "Да! Гаяне, Комитаса 30, кв. 12",
    ai2: "Спасибо, Гаяне! Заказ #1042 оформлен. Доставим завтра с 12:00 до 16:00.",
    orderNo: "Заказ #1042",
    orderText: "Льняное платье · M · 19 900 ֏ с доставкой",
    onWay: "Ваш заказ в пути",
    onWayText: "Курьер Арам приедет с 12:00 до 16:00.",
    title: "Mira Store · Заказы",
    nav: ["Заказы", "Чаты", "Склад", "Отчёты"],
    columns: ["Новые", "Оплачены", "В пути", "Доставлены"],
    cards: [
      ["#1039", "Рубашка · L", 2],
      ["#1040", "Сумка · чёрная", 1],
      ["#1041", "Платье · S", 3],
      ["#1037", "Шарф", 3],
    ],
    newCard: ["#1042", "Льняное платье · M"],
    stock: "Склад · Льняное платье",
    sizeRows: [
      ["S", 4],
      ["M", 3],
      ["L", 1],
    ],
    low: "Мало",
    toast: "Новый заказ из Instagram",
    toastText: "#1042 · Гаяне · 19 900 ֏",
    courierToast: "Отправлено курьеру",
    courierText: "#1042 · Комитаса 30, кв. 12 · 12:00–16:00",
    report: [
      ["Заказов сегодня", "23"],
      ["Продажи сегодня", "412 000 ֏"],
      ["Ждут ответа", "0"],
    ],
    reportNote: "Хит дня: льняное платье",
  },
} satisfies Record<Locale, Record<string, unknown>>;

function ProductCard({ name, price, sizes }: { name: string; price: string; sizes: string }) {
  return (
    <div className="flex w-[78%] items-center gap-2.5 self-end rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/10">
      <span
        aria-hidden="true"
        className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[linear-gradient(160deg,#e9d8bf,#c9a77f)]"
      >
        <span className="absolute inset-x-3 top-2 bottom-0 rounded-t-[40%] bg-[#f4ead9]/80" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[0.75rem] font-semibold">{name}</p>
        <p className="text-[0.8125rem] font-semibold text-signal tabular-nums">{price}</p>
        <p className="text-[0.625rem] text-[#6b6a66]">{sizes}</p>
      </div>
    </div>
  );
}

function Customer({ step, locale }: ScreenProps) {
  const t = ui[locale];

  if (step >= 3) {
    return (
      <PhoneFrame time="12:40" title={t.shop} subtitle={t.handle} channel="instagram">
        <div className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden px-3 py-3">
          <Bubble from="us" label={t.ai} meta="21:06">
            {t.ai2}
          </Bubble>
          <Enter pop delay={600} className="rounded-2xl bg-[#141414] p-3 text-white">
            <p className="flex items-center gap-2 text-[0.8125rem] font-semibold">
              <span aria-hidden="true" className="size-2 animate-demo-pulse rounded-full bg-signal motion-reduce:animate-none" />
              {t.onWay}
            </p>
            <p className="mt-1 text-[0.75rem] text-white/70">{t.onWayText}</p>
            <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={cn("h-1 flex-1 rounded-full", i < 3 ? "bg-signal" : "bg-white/20")} />
              ))}
            </div>
          </Enter>
          {step >= 4 && (
            <Enter pop delay={400} className="flex items-center gap-2.5 rounded-xl bg-[#e3efe4] px-3 py-2 text-[#1e5a2b]">
              <CheckBadge className="size-7 bg-white" />
              <p className="text-[0.8125rem] font-semibold">{t.columns[3]} · {t.orderNo}</p>
            </Enter>
          )}
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame time={step === 0 ? "21:04" : "21:06"} title={t.shop} subtitle={t.handle} channel="instagram">
      <div className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden px-3 py-3">
        <ProductCard name={t.product} price={t.price} sizes={t.sizes} />
        <Bubble from="them" meta="21:04">
          {t.msg1}
        </Bubble>
        {step === 0 && (
          <Enter delay={700}>
            <Typing />
          </Enter>
        )}
        <Enter key={`ai1-${step === 0}`} delay={step === 0 ? 1900 : 0}>
          <Bubble from="us" label={t.ai} meta="21:04">
            {t.ai1}
          </Bubble>
        </Enter>
        {step >= 1 && (
          <>
            <Enter delay={500}>
              <Bubble from="them" meta="21:05">
                {t.msg2}
              </Bubble>
            </Enter>
            <Enter pop delay={1500} className="flex items-center gap-2.5 rounded-xl bg-[#e3efe4] px-3 py-2 text-[#1e5a2b]">
              <CheckBadge className="size-7 bg-white" />
              <div className="min-w-0 leading-tight">
                <p className="text-[0.8125rem] font-semibold">{t.orderNo}</p>
                <p className="truncate text-[0.6875rem]">{t.orderText}</p>
              </div>
            </Enter>
          </>
        )}
      </div>
    </PhoneFrame>
  );
}

function Shop({ step, locale }: ScreenProps) {
  const t = ui[locale];
  // Column of the new order at each step: hidden, New, New, On the way, Delivered.
  const column = [-1, 0, 0, 2, 3][step] ?? 3;
  const mSize = step >= 1 ? 2 : 3;
  const toast =
    step === 2 ? (
      <Toast show title={t.toast} text={t.toastText} />
    ) : (
      <Toast show={step === 3} title={t.courierToast} text={t.courierText} />
    );

  return (
    <AppFrame title={t.title} nav={t.nav} active={step === 4 ? 3 : 0} toast={toast}>
      <div className="@container flex h-full flex-col gap-3 p-3">
        {step === 4 && (
          <div className="grid grid-cols-3 gap-2">
            {t.report.map(([label, value], i) => (
              <Stat key={label} label={label} value={value} accent={i === 1} delay={i * 150} />
            ))}
          </div>
        )}
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 @md:grid-cols-4">
          {t.columns.map((name, c) => (
            <div key={name} className={cn("flex min-h-0 flex-col gap-1.5 rounded-xl bg-white/70 p-2 ring-1 ring-black/[0.05]", c >= 2 && "hidden @md:flex")}>
              <p className="flex items-center justify-between px-0.5 text-[0.6875rem] font-semibold text-[#55544f]">
                <span className="truncate">{name}</span>
                <span className="tabular-nums">{t.cards.filter(([, , col]) => col === c).length + (column === c ? 1 : 0)}</span>
              </p>
              {column === c && (
                <Enter pop key={`new-${c}`} className="rounded-lg border-2 border-signal bg-white p-2 shadow-[0_8px_20px_-10px_rgb(255_91_20/0.6)]">
                  <p className="flex items-center justify-between gap-1 text-[0.75rem] font-semibold">
                    {t.newCard[0]}
                    <ChannelIcon channel="instagram" className="size-3.5" />
                  </p>
                  <p className="truncate text-[0.6875rem] text-[#55544f]">{t.newCard[1]}</p>
                  {c === 2 && <Chip tone="accent" className="mt-1">{t.courierToast}</Chip>}
                </Enter>
              )}
              {t.cards
                .filter(([, , col]) => col === c)
                .map(([no, item]) => (
                  <div key={no} className="rounded-lg bg-white p-2 ring-1 ring-black/[0.06]">
                    <p className="text-[0.75rem] font-semibold">{no}</p>
                    <p className="truncate text-[0.6875rem] text-[#6b6a66]">{item}</p>
                  </div>
                ))}
            </div>
          ))}
        </div>
        {step < 4 && (
          <div className="rounded-xl bg-white p-2.5 ring-1 ring-black/[0.06]">
            <p className="text-[0.6875rem] font-semibold text-[#55544f]">{t.stock}</p>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {t.sizeRows.map(([size, count]) => {
                const n = size === "M" ? mSize : (count as number);
                return (
                  <div key={size as string} className={cn("flex items-center justify-between rounded-lg px-2 py-1 text-[0.75rem]", size === "M" && step >= 1 ? "bg-signal/12" : "bg-[#f6f5f1]")}>
                    <span className="font-semibold">{size}</span>
                    <span className="flex items-center gap-1 tabular-nums">
                      <Enter key={`${size}-${n}`} pop>
                        {n}
                      </Enter>
                      {n <= 1 && <Chip className="px-1.5">{t.low}</Chip>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}

export const shopDemo: DemoDefinition = {
  focus: ["a", "a", "b", "b", "b"],
  posterStep: 2,
  sides: {
    en: { a: "Customer's Instagram", b: "Your order board" },
    hy: { a: "Գնորդի Instagram-ը", b: "Ձեր պատվերների վահանակը" },
    ru: { a: "Instagram покупателя", b: "Ваша доска заказов" },
  },
  steps: {
    en: [
      { title: "“Is it available? How much?”", text: "A customer asks about a product in Instagram. The AI knows your prices, sizes and stock, and answers right away." },
      { title: "The order is taken in the chat", text: "The AI collects the name, phone and address and confirms the order. Nothing gets lost in the messages." },
      { title: "It lands on your board", text: "The order appears in “New”, you get a Telegram alert, and the stock count updates by itself." },
      { title: "Straight to the courier", text: "Move the order to “On the way”. The courier gets the address in Telegram, and the customer gets a message." },
      { title: "Your day in numbers", text: "See today's orders and sales at a glance, and know that no customer is waiting for a reply." },
    ],
    hy: [
      { title: "«Կա՞։ Ի՞նչ արժե»", text: "Գնորդը Instagram-ում հարցնում է ապրանքի մասին։ AI-ն գիտի ձեր գները, չափսերն ու մնացորդը և պատասխանում է անմիջապես։" },
      { title: "Պատվերն ընդունվում է չատում", text: "AI-ն հավաքում է անունը, հեռախոսն ու հասցեն և հաստատում պատվերը։ Նամակներում ոչինչ չի կորչում։" },
      { title: "Պատվերը ձեր վահանակում է", text: "Պատվերը հայտնվում է «Նոր» սյունակում, դուք ստանում եք Telegram ծանուցում, և մնացորդն ինքն է թարմանում։" },
      { title: "Անմիջապես առաքիչին", text: "Տեղափոխեք պատվերը «Ճանապարհին»։ Առաքիչը Telegram-ով ստանում է հասցեն, իսկ գնորդը՝ հաղորդագրություն։" },
      { title: "Ձեր օրը թվերով", text: "Մեկ հայացքով տեսեք այսօրվա պատվերներն ու վաճառքը և իմացեք, որ ոչ մի գնորդ պատասխանի չի սպասում։" },
    ],
    ru: [
      { title: "«Есть в наличии? Сколько стоит?»", text: "Покупатель спрашивает о товаре в Instagram. AI знает ваши цены, размеры и остатки и отвечает сразу." },
      { title: "Заказ принят прямо в чате", text: "AI собирает имя, телефон и адрес и подтверждает заказ. В переписке ничего не теряется." },
      { title: "Заказ на вашей доске", text: "Заказ появляется в «Новых», вам приходит уведомление в Telegram, а остаток обновляется сам." },
      { title: "Сразу курьеру", text: "Переместите заказ в «В пути». Курьер получает адрес в Telegram, а покупатель — сообщение." },
      { title: "Ваш день в цифрах", text: "Сегодняшние заказы и продажи — одним взглядом. И ни один покупатель не ждёт ответа." },
    ],
  },
  A: Customer,
  B: Shop,
};
