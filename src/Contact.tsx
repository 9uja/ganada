export default function Contact() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-100 bg-neutral-150/60 p-5">
          <h2 className="font-semibold">Find us</h2>
          <p className="mt-2 text-sm text-neutral-900">
            Address: Mont Kiara, 7-1, Jalan Solaris, Solaris Mont Kiara, 50480, Wilayah Persekutuan Kuala Lumpur
            <br /> <br />
            Opening hours: AM 11:30~PM 3:00, PM 5:30~11:00
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              className="rounded-full border border-neutral-500 px-4 py-2 text-sm hover:bg-neutral-900"
              href="https://wa.me/600328566183"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a
              className="rounded-full border border-neutral-500 px-4 py-2 text-sm hover:bg-neutral-900"
              href="tel:+600328566183"
            >
              Call
            </a>
          </div>
        </div>

        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          {/* 나중에 Google Maps embed 넣기 */}
          <iframe
            title="Daorae Korean BBQ Restaurant | Solaris Mont Kiara"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.69664140106!2d101.65696167567593!3d3.174328652995886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc488a5c2b79e3%3A0xdab3e0ba30cc2b83!2sDaorae%20Korean%20BBQ%20Restaurant%20%7C%20Solaris%20Mont%20Kiara!5e0!3m2!1sko!2smy!4v1769358233779!5m2!1sko!2smy"
            className="h-full w-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

        </div>
      </div>
    </div>
  );
}
